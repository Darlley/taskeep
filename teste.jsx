import React, { useState, useRef, useEffect } from 'react';
import { Folder, Users, Plus, Trash2, Edit2, Move } from 'lucide-react';

// Simulação de dados do Supabase (substitua por chamadas reais da API)
const mockData = {
  teams: [
    { id: '1', name: 'Development Team', description: 'Main development team' },
    { id: '2', name: 'Marketing Team', description: 'Marketing and outreach' }
  ],
  projects: [
    { id: 'p1', teamId: '1', name: 'Website Redesign', color: '#3b82f6', positionX: 100, positionY: 100 },
    { id: 'p2', teamId: '1', name: 'Mobile App', color: '#10b981', positionX: 400, positionY: 100 },
    { id: 'p3', teamId: '2', name: 'Q4 Campaign', color: '#f59e0b', positionX: 100, positionY: 400 }
  ],
  tasks: [
    { id: 't1', projectId: 'p1', title: 'Design Homepage', content: 'Create mockups', positionX: 150, positionY: 250, color: '#fef3c7', width: 200, height: 150, zIndex: 1 },
    { id: 't2', projectId: 'p1', title: 'Setup Database', content: 'Configure PostgreSQL', positionX: 380, positionY: 250, color: '#dbeafe', width: 200, height: 150, zIndex: 1 },
    { id: 't3', projectId: 'p2', title: 'User Authentication', content: 'Implement login flow', positionX: 450, positionY: 250, color: '#dcfce7', width: 200, height: 150, zIndex: 1 }
  ]
};

export default function Dashboard() {
  const [view, setView] = useState('projects'); // 'projects' ou 'teams'
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedProject, setSelectedProject] = useState(null);
  const [teams] = useState(mockData.teams);
  const [projects, setProjects] = useState(mockData.projects);
  const [tasks, setTasks] = useState(mockData.tasks);
  const [selectedTasks, setSelectedTasks] = useState(new Set());
  const [isDragging, setIsDragging] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const [dragStart, setDragStart] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const canvasRef = useRef(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState(null);

  // Filtra projetos e tasks baseado na view
  const filteredProjects = view === 'teams' && selectedTeam
    ? projects.filter(p => p.teamId === selectedTeam)
    : projects;

  const filteredTasks = selectedProject
    ? tasks.filter(t => t.projectId === selectedProject)
    : [];

  // Duplo clique para criar nova task
  const handleDoubleClick = (e) => {
    if (e.target === canvasRef.current && selectedProject) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;

      const newTask = {
        id: `t${Date.now()}`,
        projectId: selectedProject,
        title: 'Nova Task',
        content: 'Clique para editar...',
        positionX: x,
        positionY: y,
        color: '#fef3c7',
        width: 200,
        height: 150,
        zIndex: Math.max(...tasks.map(t => t.zIndex), 0) + 1
      };

      setTasks([...tasks, newTask]);
    }
  };

  // Início do arrasto de tasks
  const handleTaskMouseDown = (e, taskId) => {
    e.stopPropagation();
    
    if (e.shiftKey) {
      // Seleção múltipla com shift
      setSelectedTasks(prev => {
        const newSet = new Set(prev);
        if (newSet.has(taskId)) {
          newSet.delete(taskId);
        } else {
          newSet.add(taskId);
        }
        return newSet;
      });
    } else if (!selectedTasks.has(taskId)) {
      setSelectedTasks(new Set([taskId]));
    }

    const rect = canvasRef.current.getBoundingClientRect();
    setDragStart({
      x: e.clientX - rect.left - offset.x,
      y: e.clientY - rect.top - offset.y
    });
    setIsDragging(true);
  };

  // Início da seleção por arrasto
  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current && !e.shiftKey) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;
      
      setSelectionBox({ startX: x, startY: y, endX: x, endY: y });
      setIsSelecting(true);
      setSelectedTasks(new Set());
    } else if (e.button === 1 || (e.button === 0 && e.altKey)) {
      // Pan com botão do meio ou Alt+Click
      setPanStart({ x: e.clientX - offset.x, y: e.clientY - offset.y });
      setIsPanning(true);
    }
  };

  // Movimento do mouse
  const handleMouseMove = (e) => {
    if (isPanning && panStart) {
      setOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      return;
    }

    if (isDragging && dragStart && selectedTasks.size > 0) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left - offset.x;
      const currentY = e.clientY - rect.top - offset.y;
      const deltaX = currentX - dragStart.x;
      const deltaY = currentY - dragStart.y;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          selectedTasks.has(task.id)
            ? { ...task, positionX: task.positionX + deltaX, positionY: task.positionY + deltaY }
            : task
        )
      );

      setDragStart({ x: currentX, y: currentY });
    }

    if (isSelecting && selectionBox) {
      const rect = canvasRef.current.getBoundingClientRect();
      const x = e.clientX - rect.left - offset.x;
      const y = e.clientY - rect.top - offset.y;

      setSelectionBox(prev => ({ ...prev, endX: x, endY: y }));

      // Detecta tasks dentro da caixa de seleção
      const minX = Math.min(selectionBox.startX, x);
      const maxX = Math.max(selectionBox.startX, x);
      const minY = Math.min(selectionBox.startY, y);
      const maxY = Math.max(selectionBox.startY, y);

      const selected = new Set();
      filteredTasks.forEach(task => {
        if (
          task.positionX < maxX &&
          task.positionX + task.width > minX &&
          task.positionY < maxY &&
          task.positionY + task.height > minY
        ) {
          selected.add(task.id);
        }
      });

      setSelectedTasks(selected);
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsSelecting(false);
    setSelectionBox(null);
    setIsPanning(false);
    setPanStart(null);
  };

  // Deletar tasks selecionadas
  const handleDeleteSelected = () => {
    if (selectedTasks.size > 0) {
      setTasks(tasks.filter(t => !selectedTasks.has(t.id)));
      setSelectedTasks(new Set());
    }
  };

  // Renderiza a caixa de seleção
  const renderSelectionBox = () => {
    if (!selectionBox) return null;

    const minX = Math.min(selectionBox.startX, selectionBox.endX);
    const minY = Math.min(selectionBox.startY, selectionBox.endY);
    const width = Math.abs(selectionBox.endX - selectionBox.startX);
    const height = Math.abs(selectionBox.endY - selectionBox.startY);

    return (
      <div
        style={{
          position: 'absolute',
          left: minX + offset.x,
          top: minY + offset.y,
          width,
          height,
          border: '2px dashed #3b82f6',
          backgroundColor: 'rgba(59, 130, 246, 0.1)',
          pointerEvents: 'none',
          zIndex: 10000
        }}
      />
    );
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-gray-800">Dashboard</h1>
        </div>

        {/* View Toggle */}
        <div className="p-4 border-b border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={() => { setView('projects'); setSelectedProject(null); }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                view === 'projects' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Folder size={16} />
              <span className="text-sm font-medium">Projetos</span>
            </button>
            <button
              onClick={() => { setView('teams'); setSelectedProject(null); }}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-colors ${
                view === 'teams' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              <Users size={16} />
              <span className="text-sm font-medium">Teams</span>
            </button>
          </div>
        </div>

        {/* Teams List */}
        {view === 'teams' && (
          <div className="flex-1 overflow-y-auto p-4">
            <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">Teams</h2>
            {teams.map(team => (
              <div
                key={team.id}
                onClick={() => setSelectedTeam(team.id)}
                className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                  selectedTeam === team.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <div className="font-medium text-gray-800">{team.name}</div>
                <div className="text-xs text-gray-500 mt-1">{team.description}</div>
              </div>
            ))}
          </div>
        )}

        {/* Projects List */}
        <div className="flex-1 overflow-y-auto p-4">
          <h2 className="text-xs font-semibold text-gray-500 uppercase mb-3">
            {view === 'teams' && selectedTeam ? 'Projetos do Team' : 'Todos os Projetos'}
          </h2>
          {filteredProjects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProject(project.id)}
              className={`p-3 rounded-lg mb-2 cursor-pointer transition-colors ${
                selectedProject === project.id ? 'bg-blue-50 border-2 border-blue-500' : 'bg-gray-50 hover:bg-gray-100'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: project.color }}
                />
                <div className="font-medium text-gray-800">{project.name}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Actions */}
        {selectedTasks.size > 0 && (
          <div className="p-4 border-t border-gray-200 bg-blue-50">
            <div className="text-sm text-gray-700 mb-2">
              {selectedTasks.size} task(s) selecionada(s)
            </div>
            <button
              onClick={handleDeleteSelected}
              className="w-full py-2 px-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
            >
              <Trash2 size={16} />
              Deletar
            </button>
          </div>
        )}
      </div>

      {/* Canvas Area */}
      <div className="flex-1 relative overflow-hidden">
        {!selectedProject ? (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Folder size={48} className="mx-auto mb-4 opacity-50" />
              <p className="text-lg">Selecione um projeto para visualizar as tasks</p>
              <p className="text-sm mt-2">Duplo clique para criar novas tasks</p>
            </div>
          </div>
        ) : (
          <div
            ref={canvasRef}
            onDoubleClick={handleDoubleClick}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
            className="w-full h-full relative cursor-crosshair"
            style={{ 
              backgroundImage: 'radial-gradient(circle, #e5e7eb 1px, transparent 1px)',
              backgroundSize: '20px 20px'
            }}
          >
            {/* Indicador de pan */}
            <div className="absolute top-4 right-4 bg-white px-3 py-2 rounded-lg shadow-md text-sm text-gray-600 z-50">
              Alt+Click ou Botão do meio: Pan | Duplo clique: Nova task | Shift+Click: Seleção múltipla
            </div>

            {/* Tasks */}
            {filteredTasks.map(task => (
              <div
                key={task.id}
                onMouseDown={(e) => handleTaskMouseDown(e, task.id)}
                style={{
                  position: 'absolute',
                  left: task.positionX + offset.x,
                  top: task.positionY + offset.y,
                  width: task.width,
                  height: task.height,
                  backgroundColor: task.color,
                  zIndex: selectedTasks.has(task.id) ? 1000 : task.zIndex
                }}
                className={`rounded-lg shadow-md p-3 cursor-move transition-all ${
                  selectedTasks.has(task.id) ? 'ring-4 ring-blue-500 ring-opacity-50' : ''
                }`}
              >
                <div className="font-semibold text-gray-800 mb-2 text-sm">{task.title}</div>
                <div className="text-xs text-gray-600">{task.content}</div>
                {selectedTasks.has(task.id) && (
                  <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs">
                    ✓
                  </div>
                )}
              </div>
            ))}

            {/* Selection Box */}
            {renderSelectionBox()}
          </div>
        )}
      </div>
    </div>
  );
}