import Card from '../components/molecules/Card.jsx';

export default function HelpPage() {
  return (
    <div className="help-page">
      <div className="page-header">
        <h1>Hulp</h1>
      </div>

      <Card title="Hoe te gebruiken">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <section>
            <h3 style={{ marginTop: 0, marginBottom: '0.5rem' }}>Sollicitaties toevoegen</h3>
            <p>
              Om een nieuwe sollicitatie toe te voegen, ga naar de pagina <strong>Sollicitaties</strong> en klik op
              <strong> Nieuwe sollicitatie</strong>. U kunt hier een nieuwe kandidaat aanmaken of een bestaande kandidaat
              selecteren uit de lijst.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Kandidaten beheren</h3>
            <p>
              Kandidaten worden aangemaakt wanneer u een sollicitatie invoert. U kunt kandidaatgegevens bewerken
              via de pagina <strong>Kandidaten</strong>, waar u direct de velden kunt aanpassen (naam, vakken, interne notities).
              De wijzigingen worden automatisch opgeslagen wanneer u op een ander veld klikt.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Sollicitaties bewerken</h3>
            <p>
              Op de pagina <strong>Sollicitaties</strong> kunt u een sollicitatie openen door erop te klikken.
              Op de detailpagina kunt u:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <li>Kandidaatgegevens direct bewerken</li>
              <li>Vacatures koppelen of ontkoppelen via checkboxes</li>
              <li>Documenten uploaden (CV, motivatiebrief)</li>
              <li>Documenten bekijken en verwijderen</li>
            </ul>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Vacatures beheren</h3>
            <p>
              Via de pagina <strong>Vacatures</strong> kunt u nieuwe vacatures aanmaken en bestaande vacatures bekijken.
              Klik op een vacature om de details te zien en eventueel te bewerken.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Sollicitatie status wijzigen</h3>
            <p>
              Elke sollicitatie heeft een status die de voortgang aangeeft:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <li><strong>In behandeling</strong> (geel): Standaard status voor nieuwe sollicitaties</li>
              <li><strong>Aanvaard</strong> (groen): Kandidaat is aanvaard voor de functie</li>
              <li><strong>Geweigerd</strong> (rood): Kandidaat is helaas geweigerd</li>
              <li><strong>Reserve</strong> (blauw): Kandidaat wordt op de reservelijst geplaatst</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>
              Alleen <strong>Admin</strong> en <strong>Directie</strong> kunnen de status wijzigen. Wanneer u de status
              wijzigt naar "Aanvaard", "Geweigerd" of "Reserve", wordt u gevraagd of u automatisch een e-mail wilt genereren.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>E-mails gebruiken</h3>
            <p>
              Het systeem kan automatisch e-mails genereren op basis van de sollicitatiestatus:
            </p>
            <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem', marginBottom: '0.5rem' }}>
              <li>Status "Aanvaard" → genereert uitnodigingsmail</li>
              <li>Status "Geweigerd" → genereert afwijzingsmail</li>
              <li>Status "Reserve" → genereert reservemail</li>
            </ul>
            <p style={{ marginTop: '0.5rem' }}>
              De gegenereerde e-mails vindt u onder <strong>Mails</strong> in de navigatie. U kunt de tekst bewerken
              voordat u deze kopieert. Gebruik de <strong>"Kopieer E-mail"</strong> knop om de volledige tekst te
              kopiëren naar uw klembord. Plak de tekst vervolgens in uw e-mailprogramma naar keuze. Markeer de mail
              als "Verzonden" wanneer u deze daadwerkelijk verstuurd hebt.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Zoeken</h3>
            <p>
              Op alle overzichtspaginas (Sollicitaties, Kandidaten, Vacatures, Mails) kunt u direct zoeken door in het
              zoekveld te typen. De resultaten worden automatisch gefilterd terwijl u typt.
            </p>
          </section>

          <section>
            <h3 style={{ marginBottom: '0.5rem' }}>Meldingen</h3>
            <p>
              U ontvangt automatisch meldingen wanneer er nieuwe sollicitaties of vacatures zijn toegevoegd. "Nieuw"
              betekent: toegevoegd sinds uw laatste login. Het rode cijfer bij het belpictogram toont het aantal
              ongelezen meldingen. Klik op een melding om deze als gelezen te markeren.
            </p>
          </section>
        </div>
      </Card>

      <Card title="Rechten per gebruikerstype">
        <div style={{ overflowX: 'auto' }}>
          <table className="permissions-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '0.75rem', textAlign: 'left', fontWeight: 600 }}>Actie</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Admin</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Staf</th>
                <th style={{ padding: '0.75rem', textAlign: 'center', fontWeight: 600 }}>Directie</th>
              </tr>
            </thead>
            <tbody>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Sollicitaties bekijken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Sollicitaties toevoegen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Sollicitaties bewerken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Sollicitaties verwijderen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Sollicitatie status wijzigen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Kandidaten bekijken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Kandidaten bewerken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Kandidaten verwijderen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Vacatures bekijken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Vacatures toevoegen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Vacatures bewerken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Vacatures verwijderen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Documenten uploaden</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>Documenten verwijderen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '0.75rem' }}>E-mails versturen</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>-</td>
              </tr>
              <tr>
                <td style={{ padding: '0.75rem' }}>Dashboard bekijken</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
                <td style={{ padding: '0.75rem', textAlign: 'center' }}>✓</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card title="Contact">
        <div>
          <p>
            Heeft u hulp nodig of een vraag over de applicatie? Neem gerust contact op:
          </p>
          <p style={{ marginTop: '1rem', marginBottom: 0 }}>
            <strong>E-mail:</strong>{' '}
            <a href="mailto:joris.petillion@onderwijs.gent.be" style={{ color: '#0066cc' }}>
              joris.petillion@onderwijs.gent.be
            </a>
          </p>
        </div>
      </Card>
    </div>
  );
}
