function retrieveOrders() {
  // Initialize Cloud Firestore and get a reference to the service
  const db = firebase.firestore()

  //prendo dalla raccolta "orders" tutti i vari ordini
  db.collection("orders")
    // li ordino cronologicamente in modo decrescente
    // (il piu' recente in cima)
    .orderBy("timestamp", "desc")
    .get()
    .then(querySnapshot => {
      //per ogni ordine stampo un div nella pagina che mi mostra l'ordine effettuato
      querySnapshot.forEach(doc => printOrdersFromDb(doc))
    })
    .catch(err => {
      console.error(err)
    })
}

function printOrdersFromDb(doc) {
  const main = document.querySelector('main')
  let orderName = doc.id
  let order = doc.data()

  let nDays = order['nDays']
  let tot = order['tot']

  let orderContainer = document.createElement('div')
  orderContainer.classList.add('order-container')

  let orderTitle = document.createElement('h3')
  orderTitle.classList.add('order-title')
  orderTitle.innerText = orderName

  let pNDays = document.createElement('p')
  if (nDays == 1) {
    pNDays.innerText = 'Bici prenotate per: ' + nDays + ' giorno'
  } else {
    pNDays.innerText = 'Bici prenotate per: ' + nDays + ' giorni'
  }

  let pTot = document.createElement('p')
  pTot.innerText = 'Totale: ' + tot + '€'

  orderContainer.appendChild(orderTitle)
  orderContainer.appendChild(pNDays)
  orderContainer.appendChild(pTot)

  let bikeOrderWrapper
  for (let bike of order["bikes"]) {
    bikeOrderWrapper = document.createElement('div')
    bikeOrderWrapper.classList.add('flex-row-between')

    let pName = document.createElement('p')
    pName.innerText = bike.bikeName

    let pBikeAmount = document.createElement('p')
    pBikeAmount.innerText = bike.bikeAmount

    bikeOrderWrapper.appendChild(pName)
    bikeOrderWrapper.appendChild(pBikeAmount)
    orderContainer.appendChild(bikeOrderWrapper)
  }

  main.appendChild(orderContainer)
}

window.addEventListener('load', () => {
  retrieveOrders()
})