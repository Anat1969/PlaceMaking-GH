import {lazy,Suspense} from 'react'
import PageOutline from './components/PageOutline'
import PageBoundary from './components/PageBoundary'
const Workspace=lazy(()=>import('./pages/Workspace'))
import AppContext from './components/AppContext'
const RouteEditor=lazy(()=>import('./pages/RouteEditor'))
const Understand=lazy(()=>import('./pages/Understand'))
const Sources=lazy(()=>import('./pages/Sources'))
import TopBar from './components/TopBar'
import { useRoute } from './lib/route'
import Home from './pages/Home'
const Atlas=lazy(()=>import('./pages/Atlas'))
const PlacePage=lazy(()=>import('./pages/Place'))
const WalksPage=lazy(()=>import('./pages/Walks').then(m=>({default:m.WalksPage})))
const WalkPage=lazy(()=>import('./pages/Walks').then(m=>({default:m.WalkPage})))
const Kit=lazy(()=>import('./pages/Kit'))
const Plan=lazy(()=>import('./pages/Plan'))
const City=lazy(()=>import('./pages/City'))
const Method=lazy(()=>import('./pages/Method'))
const Show=lazy(()=>import('./pages/Show'))
const Experience=lazy(()=>import('./pages/Experience'))
const Mapping=lazy(()=>import('./pages/Mapping'))
const Walls=lazy(()=>import('./pages/Walls'))
const Games=lazy(()=>import('./pages/Games'))
const Tour=lazy(()=>import('./pages/Tour'))
const Language=lazy(()=>import('./pages/Language'))

function Loading(){return <div className="app-loading" role="status"><span className="app-eyebrow">שלוש טבעות / אשדוד</span><p>טוען את מרחב העבודה…</p></div>}

export default function App() {
  const route = useRoute()
  const { page, params } = route
  if (page === 'show') return <Suspense fallback={<Loading />}><Show /></Suspense>
  let body
  switch (page) {
    case 'workspace': body = <Workspace />; break
    case 'route-editor': body = <RouteEditor />; break
    case 'understand': body = <Understand />; break
    case 'sources': body = <Sources />; break
    case 'atlas': body = <Atlas route={route} />; break
    case 'place': body = <PlacePage id={params.id} />; break
    case 'walks': body = <WalksPage />; break
    case 'walk': body = <WalkPage id={params.id} />; break
    case 'kit': body = <Kit />; break
    case 'plan': body = <Plan />; break
    case 'city': body = <City />; break
    case 'method': body = <Method />; break
    case 'xp': body = <Experience />; break
    case 'mapping': body = <Mapping />; break
    case 'walls': body = <Walls />; break
    case 'games': body = <Games />; break
    case 'tour': body = <Tour id={params.id} />; break
    case 'language': body = <Language />; break
    default: body = <Home />
  }
  return (
    <>
      <TopBar page={page} />
      <AppContext route={route} />
      <main id="main-content" tabIndex={-1} key={page === 'atlas' || page === 'tour' ? page : page + JSON.stringify(params)}><PageBoundary key={page}>{!['home','atlas','tour','route-editor'].includes(page)&&<PageOutline page={page}/>} <Suspense fallback={<Loading />}>{body}</Suspense></PageBoundary></main>
      {page !== 'atlas' && page !== 'tour' && (
        <footer className="app-footer no-print"><div><strong>שלוש טבעות / אשדוד</strong><span>ידע עירוני, חוויה ותכנון</span></div><nav aria-label="קישורים נוספים"><a href="#/sources">מקורות ומעמד המידע</a><a href="#/method">שיטת העבודה</a><a href="#/workspace">שמירה וגיבוי</a><a href="#/show">מצגת לראש העיר</a></nav><small>מפות בסיס: OpenStreetMap · מקור ודיוק מוצגים ליד כל שכבה.</small></footer>
      )}
    </>
  )
}
