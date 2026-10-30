import TopBar from './components/TopBar'
import { useRoute } from './lib/route'
import Home from './pages/Home'
import Atlas from './pages/Atlas'
import PlacePage from './pages/Place'
import { WalksPage, WalkPage } from './pages/Walks'
import Kit from './pages/Kit'
import Plan from './pages/Plan'
import City from './pages/City'
import Method from './pages/Method'
import Show from './pages/Show'
import Experience from './pages/Experience'
import Mapping from './pages/Mapping'
import Walls from './pages/Walls'
import Games from './pages/Games'
import Tour from './pages/Tour'
import Language from './pages/Language'

export default function App() {
  const route = useRoute()
  const { page, params } = route
  if (page === 'show') return <Show />
  let body
  switch (page) {
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
      <main key={page === 'atlas' || page === 'tour' ? page : page + JSON.stringify(params)}>{body}</main>
      {page !== 'atlas' && page !== 'tour' && (
        <footer className="page no-print" style={{ paddingTop: 0, paddingBottom: 32 }}>
          <div className="src" style={{ borderTop: '1px solid var(--rule)', paddingTop: 14 }}>
            מקורות: מצגת "אשדוד, עיר של טבעות" ושבעת מיזמי הפלייסמייקינג, אדריכלות העיר אשדוד · רשימת שימור ותיק תיעוד · מה נבנה סביבי · ויקיפדיה, "רובעי אשדוד" · הארכיון העירוני לתולדות אשדוד · עצבה, חוויית מבקר · מפה: OpenStreetMap .
          </div>
        </footer>
      )}
    </>
  )
}
