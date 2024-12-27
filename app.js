const { App } = require('@slack/bolt');
const fs = require('fs');
require('dotenv').config();

// Inizializza il bot
const app = new App({
    token: process.env.SLACK_BOT_TOKEN,
    signingSecret: process.env.SLACK_SIGNING_SECRET,
  });
  
  // Mock database per licenze
  let licenseData = JSON.parse(fs.readFileSync('./licenseData.json', 'utf8'));
  console.log("so far so good")
  // Ascolta le richieste di licenza (ora in forma di messaggi normali)
  app.message(/licenza\s*(.*)/, async ({ message, say }) => {
    console.log('Messaggio ricevuto:', message.text);  // Debug: log del messaggio

    const tool = message.text.split(' ')[1]; // Tool richiesto
    const user = message.user;
  
    // Verifica se il tool esiste
    if (!licenseData[tool]) {
      console.log('Tool non trovato:', tool);  // Debug: log del tool
      await say(`<@${user}>, il tool "${tool}" non è supportato.`);
      return;
    }
  
    // Verifica idoneità
    const userRole = getUserRole(user); // Simula il ruolo dell'utente
    const { availableLicenses, eligibilityRoles, assignedLicenses } = licenseData[tool];
  
    if (!eligibilityRoles.includes(userRole)) {
      await say(`<@${user}>, non sei idoneo per una licenza di "${tool}".`);
      return;
    }
  
    // Assegna licenza se disponibile
    if (availableLicenses > 0) {
      licenseData[tool].availableLicenses--;
      licenseData[tool].assignedLicenses.push(user);
      fs.writeFileSync('./licenseData.json', JSON.stringify(licenseData, null, 2));
  
      await say(`<@${user}>, la licenza per "${tool}" è stata assegnata con successo!`);
    } else {
      await say(`<@${user}>, non ci sono licenze disponibili per "${tool}".`);
    }
  });
  
  // Simula il recupero del ruolo utente (da un database o API)
  function getUserRole(user) {
    // Placeholder: tutti gli utenti sono "developer"
    return 'developer';
  }
  
  // Avvia il bot
  (async () => {
    await app.start(process.env.PORT || 3000);
    console.log('⚡️ Bot in esecuzione!');
  })();