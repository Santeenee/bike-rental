//* FIRESTORE
// Initialize Cloud Firestore and get a reference to the service
const db = firebase.firestore()

//* DOM
const main = document.querySelector('main')

//querySelectorAll() doesn't update when you add a new element
const btns = document.getElementsByTagName('button')

let total = document.getElementById('total')
let days = document.getElementById('days')
let mySound; //inizialization on load
let cartArr = []

//* FUNCTIONS

function retrieveData() {

  //collection is named "bikeCatalog" and not "bikes" 
  //to better describe the collection and avoid confusion
  db.collection("bikeCatalog")
    .orderBy("dailyPrice", "desc")
    .get()
    .then(querySnapshot => {
      //for every document aka bike category
      querySnapshot.forEach(doc => printCatalogFromDb(doc))

      showCart()
      btnsEventListener()
    })
    .catch(err => {
      console.error(err)
    });
}

function sendOrderToDatabase() {
  let arrayOfBikes = JSON.parse(localStorage.getItem('Cart'))
  let tot = Number(total.innerText)

  //milliseconds from 1st january 1970
  //(assumo che non avvenga mai più di un'ordine nello stesso millisecondo)
  let timestamp = new Date().getTime();

  // Add a new document in collection "orders" 
  //("order"+timestamp is an identifier for the document)
  //it is used for sorting out by time the order list shown in orders.html
  db.collection("orders").doc("order" + timestamp).set({

    nDays: days.value,
    timestamp: timestamp,
    tot: tot,
    bikes: arrayOfBikes

  }).then(() => {
    console.log("Document successfully written!");
    alert('Ordine aggiunto al database!')
  }).catch((error) => {
    if (error.message.includes("permission")) {
      alert('I decided to remove WRITE permissions from the database :), your order will not be saved')
    } else {
      console.error("Error writing document: ", error);
    }
  });
}

function calculateTotal(localCart) {

  total.innerText = Number(0)

  let totFromLocalStorage = localCart
    .map(bike => bike.dailyPrice * bike.bikeAmount)
    .reduce((prev, curr) => prev + curr)

  totFromLocalStorage *= Number(days.value)

  total.innerText = Number(totFromLocalStorage)
}

function bikeDing() {
  //https://mixkit.co/free-sound-effects/bike/
  mySound.play()
}

function checkout() {
  let isOrderConfirmed = false

  if (total.innerText != '0') {
    isOrderConfirmed = confirm('Sei sicuro di completare l\' ordine da ' + total.innerText + '€?')
  } else {
    alert('Il carrello è vuoto')
    return
  }

  if (isOrderConfirmed) {
    bikeDing()
    sendOrderToDatabase()
    emptyCart()
  } else {
    alert('Ordine annullato')
  }
}

function emptyCart() {
  localStorage.clear()
  localStorage.setItem('Days', days.value)
  total.innerText = Number(0)
  cartArr = []
  showCart()
}

function showCart() {
  let cart = document.getElementById('cart')

  //empty dom cart
  cart.replaceChildren()

  //if Cart in localStorage doesn't exists
  if (!localStorage.getItem('Cart')) {
    let message = document.createElement('p')
    message.id = 'p--empty-cart'
    message.innerHTML = 'Cart is empty,<br>choose a bike below'
    cart.appendChild(message)
    total.innerText = Number(0)
    return
  }

  let localCart = JSON.parse(localStorage.getItem('Cart'))
  calculateTotal(localCart)

  //show cart items
  for (const bikeObj of localCart) {
    let divWrapper = document.createElement('div')
    divWrapper.classList.add('flex-row-between')

    let bikeNameCart = document.createElement('p')
    let bikeAmountCart = document.createElement('p')

    //show bike name and quantity in cart
    bikeNameCart.innerText = bikeObj.bikeName
    bikeAmountCart.innerText = bikeObj.bikeAmount

    divWrapper.appendChild(bikeNameCart)
    divWrapper.appendChild(bikeAmountCart)
    cart.appendChild(divWrapper)
  }
}

function addToCart(btn) {
  let bikeName = btn.dataset.addToCart
  let categoryDailyPrice = btn.dataset.categoryPrice
  let nBikes = btn.parentElement.childNodes[0].value

  let obj = {
    bikeName: bikeName,
    dailyPrice: Number(categoryDailyPrice),
    bikeAmount: Number(nBikes)
  }

  //creo array di oggetti che contiene qualcosa solo
  //se f.bikeName == bikeName in uno di essi
  let doesCartcontainBikeName = cartArr.filter(f => f.bikeName == bikeName)

  if (doesCartcontainBikeName.length == 0) {
    cartArr.push(obj)
  } else {
    //modifico cartArr dove trovo l'oggetto con lo stesso nome di bikeName
    //e ne incremento il bikeAmount
    cartArr.map(f => {
      if (f.bikeName == bikeName) f.bikeAmount += Number(nBikes)
    })
    console.log('array modified')
  }

  //metto cartArr in localStorage
  localStorage.setItem('Cart', JSON.stringify(cartArr))

  showCart()
}

function printCatalogFromDb(doc) {
  let categoryName = doc.id
  let category = doc.data()
  let price = category['dailyPrice']


  //setup for some manipulation of the dom
  let divCategory
  let heading2
  let divPrice
  let divContainerImages

  //category header
  divCategory = document.createElement('div')
  divCategory.classList.add('category')
  divCategory.id = categoryName

  heading2 = document.createElement('h2')
  heading2.innerText = categoryName

  divPrice = document.createElement('div')
  divPrice.innerText = 'Daily price: ' + price + '€'
  divPrice.classList.add('daily-price')

  divContainerImages = document.createElement('div')
  divContainerImages.classList.add('container-images')

  for (let bike in category) {
    if (bike != 'dailyPrice') {
      let justAContainer = document.createElement('div')

      let bikeWrapper = document.createElement('div')
      bikeWrapper.classList.add('bike-wrapper')

      let bikeImg = document.createElement('img')
      bikeImg.src = category[bike]['src']

      let bikeNameP = document.createElement('p')
      bikeNameP.classList.add('name-p')
      bikeNameP.innerText = bike

      let selectAndBtnWrapper = document.createElement('div')
      selectAndBtnWrapper.classList.add('flex-row-1rem-gap')
      //create select with id=nomebici
      let selectElem = document.createElement('select')
      selectElem.id = bike

      //i vari option che vanno da 1 a 10 con values rispettive
      for (let i = 1; i <= 10; i++) {
        let optionElem = document.createElement('option')
        optionElem.value = i
        optionElem.innerText = optionElem.value
        selectElem.appendChild(optionElem)
      }
      selectAndBtnWrapper.appendChild(selectElem)

      //button 'Add To Cart'
      let addToCartBtn = document.createElement('button')
      addToCartBtn.innerText = 'Add to cart'
      addToCartBtn.dataset.addToCart = `${bike}`
      addToCartBtn.dataset.categoryPrice = `${price}`
      addToCartBtn.classList.add('btn', 'btn--primary', 'margin-0')
      selectAndBtnWrapper.appendChild(addToCartBtn)

      bikeWrapper.appendChild(bikeImg)
      bikeWrapper.appendChild(bikeNameP)
      justAContainer.appendChild(bikeWrapper)
      justAContainer.appendChild(selectAndBtnWrapper)
      divContainerImages.appendChild(justAContainer)
    }
  }
  divCategory.appendChild(heading2)
  divCategory.appendChild(divPrice)
  divCategory.appendChild(divContainerImages)
  main.appendChild(divCategory)
}

function btnsEventListener() {

  let buttons = Array.from(btns)
  for (let btn of buttons) { //do not remove 'let'

    btn.addEventListener('click', () => {

      // if button contains data-add-to-cart attribute
      if ('addToCart' in btn.dataset) addToCart(btn)

      if ('emptyCart' in btn.dataset) emptyCart()

      if ('checkout' in btn.dataset) checkout()

      //ho usato data-* attributes perché ci sono diversi AddToCart buttons
      //di conseguenza non potevo usare id. Infine dataset è usato 
      //per la parte di scripting, non di stile come le classi
    })
  }
}

days.addEventListener('change', () => {
  showCart()
  localStorage.setItem('Days', days.value)
})

window.addEventListener('load', () => {
  //...hopefully it will be loaded before the mySound.play() starts
  mySound = new Audio('./assets/sounds/mixkit-small-bike-bell-ding-1609.mp3')

  if (localStorage.getItem('Days')) {
    days.value = localStorage.getItem('Days')
  }

  retrieveData()
})
