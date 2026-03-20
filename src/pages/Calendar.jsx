import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronLeft, ChevronRight, Check, X, Sparkles, Calendar as CalendarIcon } from 'lucide-react';

export default function Calendar() {
  const navigate = useNavigate();
  const MAIN_COLOR = '#3f4d8e';

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today.getDate());

  const [events, setEvents] = useState(() => {
    const saved = localStorage.getItem('calendar_events_v2');
    return saved ? JSON.parse(saved) : [];
  });

  const [aiSuggestion, setAiSuggestion] = useState(() => {
    const isDismissed = localStorage.getItem('ai_suggestion_dismissed') === 'true';
    return { title: '잔금 납부 및 입주', date: 20, month: 2, year: 2026, show: !isDismissed };
  });

  const [isInputOpen, setIsInputOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [showGoogleModal, setShowGoogleModal] = useState(false);
  const [latestEventInfo, setLatestEventInfo] = useState(null);

  useEffect(() => {
    localStorage.setItem('calendar_events_v2', JSON.stringify(events));
  }, [events]);

  const years = [];
  for (let y = 2024; y <= 2040; y++) { years.push(y); }
  const months = ["JANUARY","FEBRUARY","MARCH","APRIL","MAY","JUNE","JULY","AUGUST","SEPTEMBER","OCTOBER","NOVEMBER","DECEMBER"];

  const firstDayIndex = new Date(viewYear, viewMonth, 1).getDay();
  const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();
  const calendarDays = [];
  for (let i = 0; i < firstDayIndex; i++) calendarDays.push(null);
  for (let i = 1; i <= lastDate; i++) calendarDays.push(i);

  const dismissAiSuggestion = () => {
    setAiSuggestion({ ...aiSuggestion, show: false });
    localStorage.setItem('ai_suggestion_dismissed', 'true');
  };

  const triggerGoogleModal = (eventInfo) => {
    setLatestEventInfo(eventInfo);
    setShowGoogleModal(true);
  };

  const acceptAiSuggestion = () => {
    const newEvent = { id: 'ai-extract-' + Date.now(), year: aiSuggestion.year, month: aiSuggestion.month, day: aiSuggestion.date, title: `[AI] ${aiSuggestion.title}`, time: 'AI Extraction', color: '#EF4444' };
    setEvents([newEvent, ...events]);
    dismissAiSuggestion();
    triggerGoogleModal(newEvent);
  };

  const handleDirectAdd = () => {
    if (!newTitle.trim()) return;
    const dayNamesEn = ['SUN','MON','TUE','WED','THU','FRI','SAT'];
    const dayName = dayNamesEn[new Date(viewYear, viewMonth, selectedDate).getDay()];
    const newEvent = { id: Date.now(), year: viewYear, month: viewMonth, day: selectedDate, title: newTitle, time: `${selectedDate} ${dayName}`, color: 'white' };
    setEvents([newEvent, ...events]);
    setNewTitle('');
    setIsInputOpen(false);
    triggerGoogleModal(newEvent);
  };

  const handleDeleteEvent = (id) => {
    if (window.confirm("이 일정을 삭제할까요?")) {
      setEvents(events.filter(event => event.id !== id));
    }
  };

  const handleGoogleYes = () => {
    if (!latestEventInfo) return;
    const description = "집어줌 AI 전세 사기 예방 서비스에서 추가한 일정입니다.";
    const startDate = new Date(latestEventInfo.year, latestEventInfo.month, latestEventInfo.day);
    const endDate = new Date(latestEventInfo.year, latestEventInfo.month, latestEventInfo.day + 1);
    const formatDate = (date) => {
      const y = date.getFullYear();
      const m = String(date.getMonth() + 1).padStart(2, '0');
      const d = String(date.getDate()).padStart(2, '0');
      return `${y}${m}${d}`;
    };
    const url = "https://www.google.com/calendar/render?action=TEMPLATE"
      + "&text=" + encodeURIComponent(latestEventInfo.title)
      + "&dates=" + `${formatDate(startDate)}/${formatDate(endDate)}`
      + "&details=" + encodeURIComponent(description)
      + "&crm=AVAILABLE&ctz=Asia/Seoul";
    window.open(url, '_blank', 'noopener,noreferrer');
    setShowGoogleModal(false);
  };

  const handleGoogleNo = () => setShowGoogleModal(false);

  return (
    <div style={{
      backgroundColor: MAIN_COLOR, minHeight: '100vh',
      padding: '24px 20px 120px', color: 'white',
      boxSizing: 'border-box', position: 'relative',
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    }}>
      <style>{`
        /* 달력 카드 — 흰색 배경 */
        .cal-card {
          background: white; border-radius: 28px; padding: 28px 20px;
          box-shadow: 0 20px 50px rgba(0,0,0,0.2); margin-top: 20px;
          width: 100%; box-sizing: border-box;
        }
        .date-grid { display: grid; grid-template-columns: repeat(7, 1fr); text-align: center; margin-top: 20px; }
        .day-header { font-size: 12px; font-weight: 700; color: #9CA3AF; margin-bottom: 12px; }
        .date-cell { height: 44px; display: flex; align-items: center; justify-content: center; font-size: 15px; font-weight: 600; cursor: pointer; position: relative; color: #1E1B4B; }
        .selected-date { background: ${MAIN_COLOR}; color: white; width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 12px rgba(63,77,142,0.4); }
        .event-dot { position: absolute; bottom: 4px; width: 4px; height: 4px; background: #f87171; border-radius: 50%; }
        .today-num { color: ${MAIN_COLOR}; font-weight: 900; }

        /* 이벤트 카드 — 흰색 */
        .event-card {
          background: white; padding: 16px 18px; border-radius: 18px;
          display: flex; align-items: center; justify-content: space-between;
          margin-bottom: 10px; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        /* AI 제안 박스 — 흰색 */
        .ai-box {
          background: white; padding: 18px; border-radius: 22px; margin-top: 20px;
          width: 100%; box-sizing: border-box; box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        /* 입력창 — 흰색 */
        .input-box {
          background: white; padding: 14px; border-radius: 18px;
          margin: 16px 0; display: flex; gap: 10px;
          width: 100%; box-sizing: border-box;
          box-shadow: 0 4px 16px rgba(0,0,0,0.12);
        }

        @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
      `}</style>

      {/* 상단 바 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={() => navigate(-1)} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', borderRadius: 20, padding: '8px 14px', color: 'white', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>←</button>
        <select
          value={viewYear}
          onChange={e => setViewYear(Number(e.target.value))}
          style={{ background: 'rgba(255,255,255,0.2)', color: 'white', border: '1px solid rgba(255,255,255,0.3)', padding: '6px 10px', borderRadius: 10, fontSize: 15, fontWeight: 800, outline: 'none', cursor: 'pointer' }}
        >
          {years.map(y => <option key={y} value={y} style={{ color: 'black' }}>{y}</option>)}
        </select>
      </div>

      <h1 style={{ fontSize: 32, fontWeight: 900, margin: '20px 0 4px', color: 'white' }}>Calendar</h1>
      <p style={{ margin: '0 0 4px', fontSize: 13, color: 'rgba(255,255,255,0.6)', fontWeight: 500 }}>
        {months[viewMonth].charAt(0) + months[viewMonth].slice(1).toLowerCase()} {viewYear}
      </p>

      {/* 달력 카드 */}
      <div className="cal-card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
          <ChevronLeft size={20} onClick={() => setViewMonth(p => p === 0 ? 11 : p - 1)} style={{ cursor: 'pointer', color: '#9CA3AF' }} />
          <h2 style={{ fontSize: 15, fontWeight: 900, letterSpacing: 4, color: MAIN_COLOR, margin: 0 }}>{months[viewMonth]}</h2>
          <ChevronRight size={20} onClick={() => setViewMonth(p => p === 11 ? 0 : p + 1)} style={{ cursor: 'pointer', color: '#9CA3AF' }} />
        </div>
        <div className="date-grid">
          {['S','M','T','W','T','F','S'].map((d, i) => <div key={i} className="day-header">{d}</div>)}
          {calendarDays.map((date, i) => {
            const isSelected = selectedDate === date;
            const isToday = date === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
            const hasEvent = events.some(e => e.year === viewYear && e.month === viewMonth && e.day === date);
            return (
              <div key={i} className={`date-cell${isToday && !isSelected ? ' today-num' : ''}`} onClick={() => date && setSelectedDate(date)}>
                {date && (
                  <>
                    <div className={isSelected ? 'selected-date' : ''}>{date}</div>
                    {hasEvent && !isSelected && <div className="event-dot" />}
                  </>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Upcoming Events */}
      <div style={{ marginTop: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
          <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: 'white' }}>Upcoming Events</h3>
          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 }}>{events.length}건</span>
        </div>
        {events.length > 0 ? events.map(event => (
          <div key={event.id} className="event-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{
                width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                background: event.color === '#EF4444' ? '#FEE2E2' : '#EDEDF8',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <CalendarIcon size={18} color={event.color === '#EF4444' ? '#EF4444' : MAIN_COLOR} />
              </div>
              <div>
                <p style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#1E1B4B' }}>{event.title}</p>
                <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>{event.year}.{event.month + 1}.{event.day}</p>
              </div>
            </div>
            <button onClick={() => handleDeleteEvent(event.id)} style={{ background: 'none', border: 'none', color: '#D1D5DB', cursor: 'pointer', padding: 5 }}>
              <X size={16} />
            </button>
          </div>
        )) : (
          <div style={{ textAlign: 'center', padding: '28px', background: 'rgba(255,255,255,0.08)', borderRadius: 20 }}>
            <CalendarIcon size={28} style={{ marginBottom: 8, opacity: 0.4 }} />
            <p style={{ fontSize: 13, opacity: 0.4, margin: 0 }}>등록된 일정이 없습니다</p>
          </div>
        )}
      </div>

      {/* 입력창 */}
      {isInputOpen && (
        <div className="input-box">
          <input
            type="text"
            placeholder={`Add event for ${selectedDate} ${months[viewMonth].toLowerCase()}...`}
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleDirectAdd()}
            style={{ flex: 1, border: 'none', outline: 'none', color: '#1E1B4B', fontSize: 14, fontFamily: 'inherit' }}
          />
          <button onClick={handleDirectAdd} style={{ background: MAIN_COLOR, color: 'white', border: 'none', padding: '8px 18px', borderRadius: 12, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>Add</button>
        </div>
      )}

      {/* AI 제안 */}
      {aiSuggestion.show && (
        <div className="ai-box">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <Sparkles size={16} color="#F59E0B" />
            <span style={{ fontSize: 12, fontWeight: 700, color: '#F59E0B' }}>AI Smart Extraction</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ fontSize: 14, fontWeight: 800, margin: 0, color: '#1E1B4B' }}>{aiSuggestion.title}</p>
              <p style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2 }}>서류에서 발견된 일정</p>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={dismissAiSuggestion} style={{ background: '#F3F4F6', border: 'none', borderRadius: 10, color: '#9CA3AF', padding: 8, cursor: 'pointer' }}><X size={16}/></button>
              <button onClick={acceptAiSuggestion} style={{ background: MAIN_COLOR, border: 'none', borderRadius: 10, color: 'white', padding: 8, cursor: 'pointer' }}><Check size={16}/></button>
            </div>
          </div>
        </div>
      )}

      {/* 일정 추가 버튼 */}
      {!isInputOpen && (
        <button
          onClick={() => setIsInputOpen(true)}
          style={{ width: '100%', background: 'white', color: MAIN_COLOR, border: 'none', padding: '16px', borderRadius: 18, fontWeight: 900, fontSize: 14, marginTop: 16, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, boxShadow: '0 8px 24px rgba(0,0,0,0.15)', cursor: 'pointer' }}
        >
          <Plus size={18} strokeWidth={3} /> 일정 추가하기
        </button>
      )}

      {/* 구글 캘린더 연동 모달 */}
      {showGoogleModal && (
        <div style={{
          position: 'fixed', top: 0, left: 0, width: '100%', height: '100%',
          backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center',
          justifyContent: 'center', zIndex: 1000, padding: '20px', boxSizing: 'border-box',
        }}>
          <div style={{
            backgroundColor: 'white', borderRadius: 25, width: '100%', maxWidth: 340,
            padding: '30px 24px', textAlign: 'center',
            boxShadow: '0 20px 40px rgba(0,0,0,0.2)',
            animation: 'slideUp 0.3s ease-out', color: '#1E293B',
          }}>
            <div style={{ width: 50, height: 50, background: '#F0FDF4', borderRadius: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
              <CalendarIcon size={26} color="#22C55E" />
            </div>
            <h3 style={{ fontSize: 19, fontWeight: 900, margin: '0 0 12px' }}>일정 등록 완료!</h3>
            <p style={{ fontSize: 14, color: '#64748B', lineHeight: 1.6, margin: '0 0 24px' }}>
              구글 캘린더에도 이 일정을<br/>추가하시겠습니까?
            </p>
            <div style={{ display: 'flex', gap: 10 }}>
              <button onClick={handleGoogleNo} style={{ flex: 1, padding: 14, borderRadius: 14, border: 'none', background: '#F1F5F9', color: '#64748B', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>아니요</button>
              <button onClick={handleGoogleYes} style={{ flex: 1, padding: 14, borderRadius: 14, border: 'none', background: MAIN_COLOR, color: 'white', fontWeight: 700, fontSize: 15, cursor: 'pointer', boxShadow: '0 4px 12px rgba(63,77,142,0.3)' }}>네</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
