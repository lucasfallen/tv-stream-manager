import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import Database from 'better-sqlite3';
import fs from 'fs';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Garantir que o diretório database exista
const databaseDir = path.join(__dirname, 'database');
if (!fs.existsSync(databaseDir)) {
  fs.mkdirSync(databaseDir, { recursive: true });
}

// Caminho do banco de dados
const dbPath = path.join(databaseDir, 'devices.db');
console.log(`Conectando ao banco de dados: ${dbPath}`);

// Declaração das variáveis do banco
let db;
let insertDevice;
let updateDeviceStatus;
let setDeviceOffline;
let getOnlineDevices;

// Inicializar banco de dados SQLite com opções para criar se não existir
try {
  // Verificar permissões de escrita no diretório
  try {
    fs.accessSync(databaseDir, fs.constants.W_OK);
  } catch (error) {
    throw new Error(`Sem permissão de escrita no diretório ${databaseDir}: ${error.message}`);
  }

  // Verificar se o arquivo já existe e tem permissões adequadas
  const fileExists = fs.existsSync(dbPath);
  console.log(`Arquivo do banco ${fileExists ? 'existe' : 'não existe'} e será ${fileExists ? 'aberto' : 'criado'}`);
  
  if (fileExists) {
    try {
      fs.accessSync(dbPath, fs.constants.R_OK | fs.constants.W_OK);
    } catch (error) {
      throw new Error(`Sem permissão de leitura/escrita no arquivo ${dbPath}: ${error.message}`);
    }
  }

  // Criar ou abrir o banco de dados
  db = new Database(dbPath, { verbose: console.log });
  console.log('Banco de dados SQLite conectado com sucesso');

  // Criar tabelas se não existirem
  db.exec(`
    CREATE TABLE IF NOT EXISTS devices (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      last_connection TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      is_online BOOLEAN DEFAULT 0
    );
    
    CREATE TABLE IF NOT EXISTS device_status (
      device_id TEXT PRIMARY KEY,
      current_dashboard_index INTEGER DEFAULT 0,
      is_playing BOOLEAN DEFAULT 1,
      FOREIGN KEY (device_id) REFERENCES devices(id)
    );
  `);

  // Preparar statements para operações comuns
  insertDevice = db.prepare(`
    INSERT OR REPLACE INTO devices (id, name, type, last_connection, is_online) 
    VALUES (?, ?, ?, CURRENT_TIMESTAMP, 1)
  `);

  updateDeviceStatus = db.prepare(`
    INSERT OR REPLACE INTO device_status (device_id, current_dashboard_index, is_playing)
    VALUES (?, ?, ?)
  `);

  setDeviceOffline = db.prepare(`
    UPDATE devices SET is_online = 0 WHERE id = ?
  `);

  getOnlineDevices = db.prepare(`
    SELECT d.id, d.name, d.type, s.current_dashboard_index, s.is_playing
    FROM devices d
    LEFT JOIN device_status s ON d.id = s.device_id
    WHERE d.is_online = 1 AND d.type = ?
  `);
} catch (error) {
  console.error('Erro ao inicializar o banco de dados SQLite:', error);
  
  // Implementar modo de fallback para continuar sem persistência
  console.warn('\x1b[33m%s\x1b[0m', 'AVISO: Servidor continuará funcionando sem persistência de dados');
  
  // Criar funções dummy para o modo sem persistência
  db = null;
  insertDevice = () => console.log('[SQLite OFFLINE] Ignorando inserção de dispositivo');
  updateDeviceStatus = () => console.log('[SQLite OFFLINE] Ignorando atualização de status');
  setDeviceOffline = () => console.log('[SQLite OFFLINE] Ignorando marcação offline');
  getOnlineDevices = () => [];
  
  // Sobrescrever a função executeSqlite
  global.executeSqliteOverride = true;
}

const app = express();
const server = http.createServer(app);

// Habilitar CORS para todas as origens
app.use(cors());

// Configurar o Socket.IO com permissão de CORS
const io = new Server(server, {
  cors: {
    origin: '*', // Em produção, especifique a origem correta
    methods: ['GET', 'POST']
  }
});

// Servir arquivos estáticos após a build
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Rota padrão para servir o aplicativo React
app.get('/*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

// Mapas para rastrear clientes conectados
const tvClients = new Map();  // id -> {id, name, clientType, socket, currentDashboardIndex, isPlaying}
const adminClients = new Map(); // id -> {id, name, clientType, socket}

// Função para executar operação SQLite com tratamento de erro
function executeSqlite(statement, params = [], errorMessage = 'Erro na operação SQLite') {
  // Se estiver em modo de fallback, retornar sem tentar operações SQLite
  if (global.executeSqliteOverride || !db || !statement) {
    return null;
  }
  
  try {
    return statement.run(...params);
  } catch (error) {
    console.error(`${errorMessage}:`, error);
    // Não lançar erro para permitir que a aplicação continue
    return null;
  }
}

// Configuração do Socket.IO
io.on('connection', (socket) => {
  console.log('Cliente conectado:', socket.id);
  
  // Cliente se registra (TV ou Admin)
  socket.on('register-client', ({ clientType, name }) => {
    console.log(`Cliente ${socket.id} registrado como ${clientType}: ${name}`);
    
    // Persistir no SQLite
    try {
      executeSqlite(insertDevice, [socket.id, name, clientType], 'Erro ao inserir dispositivo');
      
      if (clientType === 'tv') {
        // Registrar cliente como TV
        tvClients.set(socket.id, {
          id: socket.id,
          name,
          clientType,
          socket,
          currentDashboardIndex: 0,
          isPlaying: true
        });
        
        // Atualizar status inicial
        executeSqlite(updateDeviceStatus, [socket.id, 0, 1], 'Erro ao atualizar status inicial');
        
        // Notificar todos os admins sobre a nova TV
        emitToAllAdmins('tv-connected', {
          id: socket.id,
          name,
          currentDashboardIndex: 0,
          isPlaying: true
        });
        
        // Enviar lista de TVs para todos os admins
        emitTvsListToAllAdmins();
      } 
      else if (clientType === 'admin') {
        // Registrar cliente como Admin
        adminClients.set(socket.id, {
          id: socket.id,
          name,
          clientType,
          socket
        });
        
        // Enviar lista de TVs para o admin que acabou de se conectar
        emitTvsList(socket);
      }
    } catch (error) {
      console.error('Falha ao registrar cliente:', error);
      socket.emit('error', { message: 'Falha ao registrar cliente' });
    }
  });
  
  // Atualização de dashboards para TV específica
  socket.on('dashboard-update-to', ({ targetTvId, dashboards }) => {
    const tvClient = tvClients.get(targetTvId);
    if (tvClient && adminClients.has(socket.id)) {
      tvClient.socket.emit('dashboard-update', dashboards);
    }
  });
  
  // Atualização de dashboards para todas as TVs
  socket.on('dashboard-update-all', (dashboards) => {
    if (adminClients.has(socket.id)) {
      emitToAllTvs('dashboard-update', dashboards);
    }
  });
  
  // Mudança do dashboard atual para TV específica
  socket.on('current-dashboard-change-to', ({ targetTvId, index }) => {
    const tvClient = tvClients.get(targetTvId);
    if (tvClient && adminClients.has(socket.id)) {
      try {
        tvClient.socket.emit('current-dashboard-change', index);
        tvClient.currentDashboardIndex = index;
        
        // Persistir status no SQLite
        executeSqlite(
          updateDeviceStatus, 
          [targetTvId, index, tvClient.isPlaying ? 1 : 0], 
          'Erro ao atualizar status no SQLite'
        );
        
        // Atualizar status da TV nos admins
        emitToAllAdmins('tv-status-updated', {
          id: targetTvId,
          currentDashboardIndex: index,
          isPlaying: tvClient.isPlaying,
          name: tvClient.name
        });
      } catch (error) {
        console.error('Falha ao mudar dashboard:', error);
      }
    }
  });
  
  // Mudança do dashboard atual para todas as TVs
  socket.on('current-dashboard-change-all', (index) => {
    if (adminClients.has(socket.id)) {
      try {
        emitToAllTvs('current-dashboard-change', index);
        
        // Atualizar o índice de todas as TVs
        for (const [id, client] of tvClients.entries()) {
          client.currentDashboardIndex = index;
          
          // Persistir status no SQLite
          executeSqlite(
            updateDeviceStatus, 
            [id, index, client.isPlaying ? 1 : 0], 
            'Erro ao atualizar status no SQLite'
          );
          
          // Notificar admins sobre a atualização
          emitToAllAdmins('tv-status-updated', {
            id,
            currentDashboardIndex: index,
            isPlaying: client.isPlaying,
            name: client.name
          });
        }
      } catch (error) {
        console.error('Falha ao mudar dashboard para todos:', error);
      }
    }
  });
  
  // Mudança do status de reprodução para TV específica
  socket.on('playback-status-change-to', ({ targetTvId, isPlaying }) => {
    const tvClient = tvClients.get(targetTvId);
    if (tvClient && adminClients.has(socket.id)) {
      try {
        tvClient.socket.emit('playback-status-change', isPlaying);
        tvClient.isPlaying = isPlaying;
        
        // Persistir status no SQLite
        executeSqlite(
          updateDeviceStatus, 
          [targetTvId, tvClient.currentDashboardIndex, isPlaying ? 1 : 0], 
          'Erro ao atualizar status no SQLite'
        );
        
        // Atualizar status da TV nos admins
        emitToAllAdmins('tv-status-updated', {
          id: targetTvId,
          currentDashboardIndex: tvClient.currentDashboardIndex,
          isPlaying,
          name: tvClient.name
        });
      } catch (error) {
        console.error('Falha ao mudar status de reprodução:', error);
      }
    }
  });
  
  // Mudança do status de reprodução para todas as TVs
  socket.on('playback-status-change-all', (isPlaying) => {
    if (adminClients.has(socket.id)) {
      try {
        emitToAllTvs('playback-status-change', isPlaying);
        
        // Atualizar o status de todas as TVs
        for (const [id, client] of tvClients.entries()) {
          client.isPlaying = isPlaying;
          
          // Persistir status no SQLite
          executeSqlite(
            updateDeviceStatus, 
            [id, client.currentDashboardIndex, isPlaying ? 1 : 0], 
            'Erro ao atualizar status no SQLite'
          );
          
          // Notificar admins sobre a atualização
          emitToAllAdmins('tv-status-updated', {
            id,
            currentDashboardIndex: client.currentDashboardIndex,
            isPlaying,
            name: client.name
          });
        }
      } catch (error) {
        console.error('Falha ao mudar status de reprodução para todos:', error);
      }
    }
  });
  
  // Atualização de nome do cliente
  socket.on('client-name-update', ({ name }) => {
    try {
      if (tvClients.has(socket.id)) {
        // Atualizar nome da TV
        const tvClient = tvClients.get(socket.id);
        tvClient.name = name;
        
        // Persistir nome no SQLite
        executeSqlite(
          insertDevice, 
          [socket.id, name, 'tv'], 
          'Erro ao atualizar nome da TV'
        );
        
        // Notificar admins sobre a mudança de nome
        emitToAllAdmins('tv-updated', {
          id: socket.id,
          name
        });
      } 
      else if (adminClients.has(socket.id)) {
        // Atualizar nome do admin
        const adminClient = adminClients.get(socket.id);
        adminClient.name = name;
        
        // Persistir nome no SQLite
        executeSqlite(
          insertDevice, 
          [socket.id, name, 'admin'], 
          'Erro ao atualizar nome do admin'
        );
      }
    } catch (error) {
      console.error('Falha ao atualizar nome do cliente:', error);
    }
  });
  
  // TV envia atualização de status
  socket.on('tv-status-update', (status) => {
    if (tvClients.has(socket.id)) {
      try {
        const tvClient = tvClients.get(socket.id);
        tvClient.currentDashboardIndex = status.currentDashboardIndex;
        tvClient.isPlaying = status.isPlaying;
        
        // Persistir status no SQLite
        executeSqlite(
          updateDeviceStatus, 
          [socket.id, status.currentDashboardIndex, status.isPlaying ? 1 : 0], 
          'Erro ao atualizar status da TV'
        );
        
        // Notificar admins sobre a atualização
        emitToAllAdmins('tv-status-updated', {
          id: socket.id,
          currentDashboardIndex: status.currentDashboardIndex,
          isPlaying: status.isPlaying,
          name: tvClient.name
        });
      } catch (error) {
        console.error('Falha ao atualizar status da TV:', error);
      }
    }
  });
  
  // Desconexão do cliente
  socket.on('disconnect', () => {
    console.log('Cliente desconectado:', socket.id);
    
    try {
      // Marcar dispositivo como offline no SQLite
      executeSqlite(setDeviceOffline, [socket.id], 'Erro ao marcar dispositivo como offline');
      
      if (tvClients.has(socket.id)) {
        // Cliente era uma TV
        const tvClient = tvClients.get(socket.id);
        tvClients.delete(socket.id);
        
        // Notificar admins sobre a desconexão
        emitToAllAdmins('tv-disconnected', {
          id: socket.id,
          name: tvClient.name
        });
        
        // Atualizar lista de TVs
        emitTvsListToAllAdmins();
      } 
      else if (adminClients.has(socket.id)) {
        // Cliente era um admin
        adminClients.delete(socket.id);
      }
    } catch (error) {
      console.error('Falha ao processar desconexão do cliente:', error);
    }
  });
});

// Funções auxiliares

// Enviar lista de TVs para um admin específico
function emitTvsList(adminSocket) {
  const tvsList = Array.from(tvClients.values()).map(tv => ({
    id: tv.id,
    name: tv.name,
    currentDashboardIndex: tv.currentDashboardIndex,
    isPlaying: tv.isPlaying
  }));
  
  adminSocket.emit('tvs-list', tvsList);
}

// Enviar lista de TVs para todos os admins
function emitTvsListToAllAdmins() {
  const tvsList = Array.from(tvClients.values()).map(tv => ({
    id: tv.id,
    name: tv.name,
    currentDashboardIndex: tv.currentDashboardIndex,
    isPlaying: tv.isPlaying
  }));
  
  emitToAllAdmins('tvs-list', tvsList);
}

// Emitir evento para todas as TVs
function emitToAllTvs(event, data) {
  for (const client of tvClients.values()) {
    client.socket.emit(event, data);
  }
}

// Emitir evento para todos os admins
function emitToAllAdmins(event, data) {
  for (const client of adminClients.values()) {
    client.socket.emit(event, data);
  }
}

// Iniciar o servidor
const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
}); 