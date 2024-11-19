import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Title,
  Form,
  Input,
  Button,
  ExpenseList,
  ExpenseItem,
} from './styles';
import moment from 'moment';

interface Evento {
  _id: string;
  description: string;
  local: string;
  title: string;
  date: string;
}

const EventoPage: React.FC = () => {
  const [eventos, setEventos] = useState<Evento[]>([]);
  const [description, setDescription] = useState('');
  const [title, setTitle] = useState('');
  const [local, setLocal] = useState('');
  const [date, setDate] = useState('');

  const [editingEvento, setEditingEvento] = useState<Evento | null>(null); // Estado para evento em edição
  const [expandedEventos, setExpandedEventos] = useState<Set<string>>(new Set()); // Estado para controlar quais eventos têm detalhes visíveis

  useEffect(() => {
    handleListEvento();
  }, []);

  // Adicionar um evento
  const handleAddEvento = async () => {
    if (description && title && local && date) {
      try {
        const response = await axios.post('http://192.168.1.4:3000/evento', {
          description,
          title,
          local,
          date,
        });

        if (response.data.success) {
          const newEvento = response.data.data;
          setEventos([...eventos, newEvento]);
          setTitle('');
          setDescription('');
          setLocal('');
          setDate('');
        }
      } catch (error) {
        console.error('Erro ao adicionar evento:', error);
      }
    }
  };

  // Excluir evento
  const handleDeleteEvento = async (_id: string) => {
    try {
      const response = await axios.delete(`http://192.168.1.4:3000/evento/delete/${_id}`);

      if (response.data.success) {
        const filteredEventos = eventos.filter((evento) => evento._id !== _id);
        setEventos(filteredEventos);
      }
    } catch (error) {
      console.error('Erro ao excluir evento:', error);
    }
  };

  // Atualizar evento
  const handleUpdateEvento = async () => {
    if (editingEvento && description && title && local && date) {
      try {
        const updatedEvento = {
          ...editingEvento,
          description,
          title,
          local,
          date,
        };

        const response = await axios.put(`http://192.168.1.4:3000/evento/update/${editingEvento._id}`, updatedEvento);

        if (response.data.success) {
          const updatedEventos = eventos.map((evento) =>
            evento._id === editingEvento._id ? response.data.data : evento
          );
          setEventos(updatedEventos);
          setEditingEvento(null);  // Limpar estado de edição após atualização
          setDescription('');
          setTitle('');
          setLocal('');
          setDate('');
        }
      } catch (error) {
        console.error('Erro ao atualizar evento:', error);
      }
    }
  };

  // Listar eventos
  const handleListEvento = async () => {
    try {
      const response = await axios.get('http://192.168.1.4:3000/evento/list');
      const eventoList = response.data.data;
      setEventos(eventoList);
    } catch (error) {
      console.error('Erro ao listar eventos:', error);
    }
  };

  // Editar evento
  const handleEditEvento = (evento: Evento) => {
    setEditingEvento(evento);
    setDescription(evento.description);
    setTitle(evento.title);
    setLocal(evento.local);
    setDate(evento.date);
  };

  // Alternar visibilidade dos detalhes do evento
  const handleToggleDetails = (eventoId: string) => {
    const updatedExpandedEventos = new Set(expandedEventos);
    if (expandedEventos.has(eventoId)) {
      updatedExpandedEventos.delete(eventoId);
    } else {
      updatedExpandedEventos.add(eventoId);
    }
    setExpandedEventos(updatedExpandedEventos);
  };

  return (
    <Container>
      <Title>Controle de Eventos</Title>
      <Form>
        <Input
          type="text"
          placeholder="Título"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Descrição"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Input
          type="text"
          placeholder="Local"
          value={local}
          onChange={(e) => setLocal(e.target.value)}
        />
        <Input
          type="date"
          placeholder="Data"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {editingEvento ? (
          <Button onClick={handleUpdateEvento}>Atualizar Evento</Button>
        ) : (
          <Button onClick={handleAddEvento}>Cadastrar Evento</Button>
        )}
      </Form>

      <ExpenseList>
        {eventos.map((evento) => (
          <ExpenseItem key={evento._id}>
            {evento.title} | {moment(evento.date).format("DD-MMM-YYYY")}

            {/* Botão para mostrar/ocultar os detalhes */}
            <Button onClick={() => handleToggleDetails(evento._id)}>
              Detalhes
            </Button>

            {/* Exibir os detalhes somente se o evento estiver expandido */}
            {expandedEventos.has(evento._id) && (
              <div>
                <p>Descrição: {evento.description}</p>
                <p>Local: {evento.local}</p>
              </div>
            )}

            <Button onClick={() => handleDeleteEvento(evento._id)} red>
              Excluir
            </Button>
            <Button onClick={() => handleEditEvento(evento)}>
              Editar
            </Button>
          </ExpenseItem>
        ))}
      </ExpenseList>
    </Container>
  );
};

export default EventoPage;
