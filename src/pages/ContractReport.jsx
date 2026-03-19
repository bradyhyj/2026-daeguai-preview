import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-3.1-flash-lite-preview" });

function ContractReport() {
  const navigate = useNavigate();
  const [bookmarkedIds, setBookmarkedIds] = useState({});
  const [clauses, setClauses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setBookmarkedIds({});
    generateClauses();
  }, []);

  const generateClauses = async () => {
    try {
      const savedData = localStorage.getItem('ai_analysis_result');
      const analysisContext = savedData ? savedData : "특이사항 없음";

      const prompt = `
        너는 전세 사기를 예방하는 전문 변호사야. 
        다음 부동산 분석 결과를 바탕으로, 세입자를 완벽하게 보호할 수 있는 '안심 특약' 3가지를 작성해줘.
        
        [부동산 분석 결과]
        ${analysisContext}

        [출력 규칙]
        반드시 아래 JSON 배열 형식으로만 대답해. 마크다운 기호 없이 순수 JSON만 출력해.
        [
          { 
            "id": 1, 
            "title": "특약 제목 (예: 근저당 말소 조건부 특약)", 
            "badge": "주의 대응" 또는 "기본 권장", 
            "type": "purple" (주의) 또는 "green" (안전/기본), 
            "law": "관련 법률 (예: 주택임대차보호법)", 
            "desc": "실제 계약서에 들어갈 구체적이고 법적인 특약 문구" 
          },
          ... 2, 3번 항목
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      const cleanJson = responseText.replace(/```json|```/g, "").trim();
      setClauses(JSON.parse(cleanJson));
    } catch (error) {
      console.error("특약 생성 오류:", error);
      setClauses([
        { id: 1, title: "기본 안전 특약", badge: "기본 권장", type: "green", law: "주택임대차보호법", desc: "임대인은 잔금일 익일까지 현재의 권리관계를 유지한다." }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const toggleBookmark = (title, desc) => {
    const currentList = JSON.parse(localStorage.getItem('bookmarked_terms') || '[]');
    let newList;
    if (bookmarkedIds[title]) {
      newList = currentList.filter(item => item.title !== title);
      alert('특약 북마크가 해제되었습니다.');
    } else {
      newList = [...currentList, { id: Date.now(), title, desc }];
      alert('나의 특약에 저장되었습니다! 북마크 페이지에서 확인하세요.');
    }
    localStorage.setItem('bookmarked_terms', JSON.stringify(newList));
    setBookmarkedIds(prev => ({ ...prev, [title]: !prev[title] }));
  };

  const badgeConfig = {
    purple: { bg: 'rgba(248,113,113,0.13)', color: '#F87171', border: 'rgba(248,113,113,0.25)' },
    green:  { bg: 'rgba(16,185,129,0.12)',  color: '#10b981', border: 'rgba(16,185,129,0.25)' },
  };

  const accentConfig = {
    purple: '#EF4444',
    green:  '#10b981',
  };

  return (
    <div style={{
      width: '100%', backgroundColor: '#F0F0F7',
      display: 'flex', flexDirection: 'column', minHeight: '100vh',
      overflow: 'hidden',
      fontFamily: "'Noto Sans KR', 'Apple SD Gothic Neo', sans-serif",
    }}>

      {/* ── Header ── */}
      <div style={{
        background: '#4B4F8F',
        padding: '20px 20px 24px',
        borderRadius: '0 0 28px 28px',
        color: 'white', flexShrink: 0,
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <div onClick={() => navigate(-1)} style={{
            cursor: 'pointer', fontWeight: 700, fontSize: 14,
            background: 'rgba(255,255,255,0.15)', padding: '8px 16px', borderRadius: 20,
          }}>
            ← Back
          </div>
          <span style={{ fontSize: 15, fontWeight: 800 }}>AI 특약 자동 생성</span>
          <div style={{ width: 60 }} />
        </div>

        <div style={{
          background: 'rgba(255,255,255,0.12)',
          border: '1px solid rgba(255,255,255,0.2)',
          borderRadius: 18, padding: '18px 20px',
        }}>
          <p style={{ margin: '0 0 5px', fontSize: 11, color: 'rgba(255,255,255,0.6)', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            AI 맞춤형 특약 리포트
          </p>
          <p style={{ margin: '0 0 12px', fontSize: 18, fontWeight: 900, color: 'white' }}>
            위험 요소 방어 특약
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#FBBF24', flexShrink: 0, display: 'inline-block' }} />
            <span style={{ fontSize: 12, color: '#FCD34D', fontWeight: 600 }}>
              AI가 분석한 결과를 바탕으로 생성되었습니다.
            </span>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div style={{ flex: 1, padding: '20px 16px 24px', overflowY: 'auto' }}>

        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
          <h3 style={{
            margin: 0, fontSize: 15, fontWeight: 800, color: '#1E1B4B',
            display: 'flex', alignItems: 'center', gap: 8,
          }}>
            <span style={{
              width: 26, height: 26, background: '#4B4F8F', borderRadius: '50%',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', flexShrink: 0,
            }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <rect x="2" y="1" width="10" height="12" rx="1.5" stroke="white" strokeWidth="1.4"/>
                <path d="M4 5h6M4 7.5h6M4 10h3.5" stroke="white" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
            </span>
            안심 특약 리스트
          </h3>
        </div>

        {loading ? (
          <div style={{
            background: 'white', borderRadius: 16, padding: 40,
            textAlign: 'center', boxShadow: '0 2px 8px rgba(75,79,143,0.06)',
          }}>
            <div style={{ fontSize: 32, marginBottom: 12 }}>✍️</div>
            <p style={{ margin: 0, fontSize: 14, color: '#4B4F8F', fontWeight: 700 }}>
              AI가 맞춤형 특약을 작성하고 있습니다...
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {clauses.map((item) => {
              const badge = badgeConfig[item.type] || badgeConfig.green;
              const accent = accentConfig[item.type] || accentConfig.green;
              return (
                <div key={item.id} style={{
                  background: 'white', borderRadius: 18,
                  padding: '18px 20px',
                  border: '1.5px solid #EDEDF8',
                  boxShadow: '0 2px 8px rgba(75,79,143,0.06)',
                  position: 'relative',
                }}>
                  <button onClick={() => toggleBookmark(item.title, item.desc)} style={{
                    position: 'absolute', right: 14, top: 16,
                    background: 'none', border: 'none', cursor: 'pointer', padding: 4,
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24"
                      fill={bookmarkedIds[item.title] ? '#4B4F8F' : 'none'}
                      stroke={bookmarkedIds[item.title] ? '#4B4F8F' : '#CBD5E1'}
                      strokeWidth="2.5">
                      <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z" />
                    </svg>
                  </button>

                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, paddingRight: 28 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: '#EDEDF8', color: '#4B4F8F',
                      fontSize: 14, fontWeight: 800, flexShrink: 0,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      {item.id}
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 800, color: '#1E1B4B', lineHeight: 1.3 }}>
                      {item.title}
                    </span>
                    <span style={{
                      marginLeft: 'auto', flexShrink: 0,
                      background: badge.bg, color: badge.color,
                      border: `1px solid ${badge.border}`,
                      fontSize: 10, fontWeight: 800,
                      padding: '4px 9px', borderRadius: 20,
                    }}>
                      {item.badge}
                    </span>
                  </div>

                  <div style={{
                    background: '#F8F9FC',
                    borderLeft: `3.5px solid ${accent}`,
                    borderRadius: '0 10px 10px 0',
                    padding: '12px 14px', marginBottom: 10,
                  }}>
                    <p style={{ margin: 0, fontSize: 13, lineHeight: 1.75, color: '#374151', fontWeight: 500 }}>
                      "{item.desc}"
                    </p>
                  </div>

                  <p style={{ margin: 0, fontSize: 11, color: '#4B4F8F', fontWeight: 700 }}>
                    📜 {item.law} 관련
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

export default ContractReport;
