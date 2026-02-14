import { useEffect } from 'react'
import '../styles/Letter.css'

export default function Letter() {
  useEffect(() => {
    // Disabilita il pointer lock quando entri in questa pagina
    document.exitPointerLock?.()
    // Assicura che il mouse sia visibile
    document.body.style.cursor = 'auto'
  }, []) 
  return (
    <div className="letter-container">
      <div className="letter-content">
        <div className="letter-header">
          <h1>To my partner in crime,</h1>
          <div className="heart">❤️</div>
        </div>

        <div className="letter-body">
          <p>
            Caro carita,
          </p>

          <p>
            Sono passati due anni da quando abbiamo iniziato a scriverci e poi a vederci, 
            e ancora oggi mi stupisce quanto profondamente tu sia entrata nella mia vita. 
            Da quel primo momento tutto ha preso una direzione diversa, più vera, più piena, 
            più nostra.
          </p>

          <p>
            Adesso siamo lontani e non è facile. Ci sono giorni in cui la distanza pesa 
            davvero tanto, in cui vorrei solo poterti abbracciare senza dover contare i 
            chilometri o aspettare un volo o un momento possibile. Però anche 
            così, anche da lontano, continuo a sceglierti ogni giorno.
          </p>

          <p>
            Voglio che tu sappia una cosa importante: adesso che ho comprato casa, avrai 
            sempre un posto sicuro dove stare. Non solo un tetto, ma uno spazio che è anche 
            tuo, dove puoi sentirti protetta, accolta e a casa davvero.
          </p>

          <p>
            Sogno il momento in cui la distanza non farà più parte della nostra quotidianità, 
            quando non ci saranno più schermi tra noi ma solo la vita condivisa, le cose 
            semplici, le mattine insieme, la normalità che desideriamo costruire.
          </p>

          <p>
            Grazie per questi due anni, per la pazienza, per la forza, per tutto l'amore che 
            continuiamo a darci anche quando è difficile. Ti amo, e non vedo l'ora di vivere 
            tutto il resto insieme a te.
          </p>


          <div className="letter-signature">
            <p>Yours, always and forever,</p>
            <p className="signature-name"></p>
          </div>
        </div>

        <button onClick={() => window.location.href = '/virtual-museum/'} className="back-button">
          ← Torna al Museo
        </button>
      </div>
    </div>
  )
}
