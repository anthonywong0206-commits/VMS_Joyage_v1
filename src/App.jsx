
import { useEffect, useState } from 'react'
import { BarChart3, ClipboardList, Shield } from 'lucide-react'

const TYPES = ['探訪服務','中心活動','小組服務','行政支援','電話關懷','外展服務','其他']

export default function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('currentVolunteer')) || null)
  const [tab, setTab] = useState('input')
  const [records, setRecords] = useState(JSON.parse(localStorage.getItem('serviceRecords')) || [])
  const [volunteers, setVolunteers] = useState(JSON.parse(localStorage.getItem('volunteers')) || [])
  const [form, setForm] = useState({
    serviceDate:'',
    serviceName:'',
    serviceType:'探訪服務',
    hours:'',
    serviceTarget:'',
    remark:'',
    confirmed:false
  })

  useEffect(() => {
    localStorage.setItem('serviceRecords', JSON.stringify(records))
  }, [records])

  useEffect(() => {
    localStorage.setItem('volunteers', JSON.stringify(volunteers))
  }, [volunteers])

  if (!user) {
    return <Login onLogin={(u)=> {
      setUser(u)
      localStorage.setItem('currentVolunteer', JSON.stringify(u))
    }} />
  }

  const addRecord = () => {
    const item = {
      ...form,
      id: Date.now(),
      volunteerNo: user.volunteerNo,
      chineseName: user.chineseName
    }
    setRecords([item, ...records])
    setForm({
      serviceDate:'',
      serviceName:'',
      serviceType:'探訪服務',
      hours:'',
      serviceTarget:'',
      remark:'',
      confirmed:false
    })
  }

  const totalHours = records.reduce((a,b)=>a+Number(b.hours || 0),0)

  return (
    <div className="min-h-screen bg-slate-100 pb-24">
      <header className="sticky top-0 bg-white/80 backdrop-blur border-b p-4 flex justify-between">
        <div>
          <h1 className="font-bold">Volunteer Ledger</h1>
          <p className="text-xs text-slate-500">{user.chineseName}</p>
        </div>
        <button
          className="text-sm bg-red-500 text-white px-3 py-1 rounded-xl"
          onClick={()=>{
            localStorage.removeItem('currentVolunteer')
            setUser(null)
          }}
        >
          登出
        </button>
      </header>

      {tab === 'input' && (
        <main className="p-4 space-y-4">
          <div className="bg-white rounded-3xl p-4 shadow">
            <h2 className="font-bold mb-3">新增服務紀錄</h2>

            <input className="w-full border rounded-xl p-3 mb-3" placeholder="服務日期" type="date"
              value={form.serviceDate}
              onChange={(e)=>setForm({...form, serviceDate:e.target.value})}
            />

            <input className="w-full border rounded-xl p-3 mb-3" placeholder="服務名稱"
              value={form.serviceName}
              onChange={(e)=>setForm({...form, serviceName:e.target.value})}
            />

            <select className="w-full border rounded-xl p-3 mb-3"
              value={form.serviceType}
              onChange={(e)=>setForm({...form, serviceType:e.target.value})}
            >
              {TYPES.map(t=><option key={t}>{t}</option>)}
            </select>

            <input className="w-full border rounded-xl p-3 mb-3" placeholder="服務時數"
              value={form.hours}
              onChange={(e)=>setForm({...form, hours:e.target.value})}
            />

            <input className="w-full border rounded-xl p-3 mb-3" placeholder="服務對象"
              value={form.serviceTarget}
              onChange={(e)=>setForm({...form, serviceTarget:e.target.value})}
            />

            <textarea className="w-full border rounded-xl p-3 mb-3" placeholder="備註"
              value={form.remark}
              onChange={(e)=>setForm({...form, remark:e.target.value})}
            />

            <label className="flex items-center gap-2 mb-4">
              <input type="checkbox"
                checked={form.confirmed}
                onChange={(e)=>setForm({...form, confirmed:e.target.checked})}
              />
              已完成客戶確認
            </label>

            <button
              onClick={addRecord}
              className="w-full bg-slate-900 text-white rounded-2xl py-3 font-bold"
            >
              儲存服務紀錄
            </button>
          </div>

          <div className="space-y-3">
            {records.map(r=>(
              <div key={r.id} className={`rounded-3xl p-4 shadow bg-white border-l-8 ${r.confirmed ? 'border-green-500':'border-yellow-400'}`}>
                <div className="flex justify-between">
                  <div>
                    <p className="font-bold">{r.serviceName}</p>
                    <p className="text-sm text-slate-500">{r.serviceType}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-emerald-600">+ {r.hours}</p>
                    <p className="text-xs">小時</p>
                  </div>
                </div>

                <div className="mt-3 text-sm text-slate-600">
                  <p>日期：{r.serviceDate}</p>
                  <p>對象：{r.serviceTarget}</p>
                  <p>備註：{r.remark}</p>
                </div>

                <button
                  onClick={()=>setRecords(records.filter(x=>x.id !== r.id))}
                  className="mt-3 text-red-500 text-sm"
                >
                  刪除
                </button>
              </div>
            ))}
          </div>
        </main>
      )}

      {tab === 'stats' && (
        <div className="p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-700 text-white rounded-3xl p-6 shadow-xl">
            <p className="text-sm opacity-70">年度總服務時數</p>
            <h2 className="text-5xl font-bold mt-2">{totalHours}</h2>
            <p className="mt-2">服務次數：{records.length}</p>
          </div>
        </div>
      )}

      {tab === 'admin' && (
        <div className="p-4">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-bold text-xl">義工管理</h2>
            <button
              className="bg-slate-900 text-white rounded-full w-10 h-10"
              onClick={()=>{
                const name = prompt('中文姓名')
                if (!name) return
                const no = prompt('義工編號')
                const item = {
                  id: Date.now(),
                  chineseName:name,
                  volunteerNo:no
                }
                setVolunteers([item, ...volunteers])
              }}
            >+</button>
          </div>

          <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
            {volunteers.map(v=>(
              <div key={v.id} className="bg-white rounded-3xl p-4 shadow">
                <p className="font-bold">{v.chineseName}</p>
                <p className="text-sm text-slate-500">{v.volunteerNo}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-md bg-white/80 backdrop-blur rounded-3xl shadow-lg border flex justify-around py-3">
        <button onClick={()=>setTab('input')} className={tab==='input' ? 'text-black':'text-slate-400'}>
          <ClipboardList />
        </button>
        <button onClick={()=>setTab('stats')} className={tab==='stats' ? 'text-black':'text-slate-400'}>
          <BarChart3 />
        </button>
        <button onClick={()=>setTab('admin')} className={tab==='admin' ? 'text-black':'text-slate-400'}>
          <Shield />
        </button>
      </nav>
    </div>
  )
}

function Login({ onLogin }) {
  const [volunteerNo, setVolunteerNo] = useState('')
  const [chineseName, setChineseName] = useState('')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-slate-200 p-6">
      <div className="bg-white/80 backdrop-blur rounded-3xl shadow-xl p-6 w-full max-w-md">
        <h1 className="text-3xl font-bold mb-2">Volunteer Ledger</h1>
        <p className="text-slate-500 mb-6">像記帳一樣，清楚記錄每一次義工服務。</p>

        <input
          className="w-full border rounded-2xl p-4 mb-4"
          placeholder="義工編號"
          value={volunteerNo}
          onChange={(e)=>setVolunteerNo(e.target.value)}
        />

        <input
          className="w-full border rounded-2xl p-4 mb-6"
          placeholder="中文姓名"
          value={chineseName}
          onChange={(e)=>setChineseName(e.target.value)}
        />

        <button
          className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold"
          onClick={()=>onLogin({ volunteerNo, chineseName })}
        >
          開始記錄
        </button>
      </div>
    </div>
  )
}
