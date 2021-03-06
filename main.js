const BASE_URL = 'https://lighthouse-user-api.herokuapp.com'
const INDEX_URL = BASE_URL + '/api/v1/users/'
const peopleData = []
const dataPanel = document.querySelector('#data-panel')
const peopleModal = document.querySelector('#people-modal')
const searchForm = document.querySelector('#search-form')
const searchInput = document.querySelector('#search-input')
const personalData_PER_PAGE = 12
let filteredPerson = []

function renderPeopleData(data) {
  let rawHTML = ''
  data.forEach((item => {
    rawHTML += `
      <div class="col-sm-3">
        <div class="mb-2">
          <div class="card">
            <img class="card-img-top" data-toggle="modal" data-target="#people-modal" data-id="${item.id}" src="${item.avatar}" alt="Personal Avatar">
              <div class="card-body">
                <p class="name">${item.name} ${item.surname}</p>
                <p class="region">From: ${item.region}</p>
              </div>
            </div>
          </div>
        </div>`
    dataPanel.innerHTML = rawHTML
  }))
}

function showPeopleModal(id) {
  const peopleName = document.querySelector('#people-name')
  const peopleAvatar = document.querySelector('#people-modal-avatar')
  const peopleGender = document.querySelector('#people-modal-gender')
  const peopleAge = document.querySelector('#people-modal-age')
  const peopleBirthday = document.querySelector('#people-modal-birthday')
  const peopleRegion = document.querySelector('#people-modal-region')
  const peopleEmail = document.querySelector('#people-modal-email')
  const favoritePeople = document.querySelector('.modal-footer')

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data
    peopleName.innerText = data.name + data.surname
    peopleGender.innerText = `Gender: ${data.gender}`
    peopleAge.innerText = `Age: ${data.age}`
    peopleBirthday.innerText = `Birthday: ${data.birthday}`
    peopleRegion.innerText = `From: ${data.region}`
    peopleEmail.innerText = `Email: ${data.email}`
    peopleAvatar.innerHTML = `<img src="${data.avatar}" alt="people-avatar" class="img-fluid">`
    favoritePeople.innerHTML = `<button type="button" class="btn btn-add-favorite" data-id="${data.id}">Add to favorite</button><button type="button" class="btn btn-remove-favorite" data-id="${data.id}">Remove from favorite</button><button type="button" class="btn btn-secondary" data-dismiss="modal">Close</button>`
  })
}

function getPersonalDataByPage(page) {
  //???????????? index 
  const data = filteredPerson.length ? filteredPerson : peopleData
  const startIndex = (page - 1) * personalData_PER_PAGE
  //???????????????????????????
  return data.slice(startIndex, startIndex + personalData_PER_PAGE)
}

function renderPaginator(amount) {
  //???????????????
  const numberOfPages = Math.ceil(amount / personalData_PER_PAGE)
  //?????? template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //?????? HTML
  paginator.innerHTML = rawHTML
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoritePeople')) || []
  const people = peopleData.find((people) => people.id === id)
  if (list.some((people) => people.id === id)) {
    return alert('????????????????????????????????????')
  }
  list.push(people)
  localStorage.setItem('favoritePeople', JSON.stringify(list))
}

function removeFromFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoritePeople'))
  if (!list) return

  //?????? id ???????????????????????? index
  const peopleIndex = list.findIndex((people) => people.id === id)
  if (peopleIndex === -1) return

  //????????????????????????
  list.splice(peopleIndex, 1)

  //?????? local storage
  localStorage.setItem('favoritePeople', JSON.stringify(list))
}

axios
  .get(INDEX_URL)
  .then((response) => {
    peopleData.push(...response.data.results)
    renderPaginator(peopleData.length)
    renderPeopleData(getPersonalDataByPage(1))
  })
  .catch((err) => console.log(err))

dataPanel.addEventListener('click', function onPersonalAvatar(event) {
  if (event.target.matches('.card-img-top')) {
    showPeopleModal(event.target.dataset.id)
  }
})

peopleModal.addEventListener('click', function onAddFavorite(event) {
  if (event.target.matches('.btn-add-favorite')) {
    console.log(event.target.dataset.id)
    addToFavorite(Number(event.target.dataset.id))
  } else if (event.target.matches('.btn-remove-favorite')) {
    removeFromFavorite(Number(event.target.dataset.id))
  }
})

searchForm.addEventListener('submit', function onSearchFormSubmitted(event) {
  event.preventDefault()
  const keyword = searchInput.value.trim().toLowerCase()
  const keywordArr = keyword.split(' ')
  for (let everyKeyword of keywordArr) {
    //????????????????????????????????????
    if (everyKeyword === '') {
      filteredPerson = peopleData.filter((people) =>
        people.name.toLowerCase().includes(keyword))
      //??????first name
    } else if (peopleData.some((people) => people.name.toLowerCase() === everyKeyword)) {
      filteredPerson = peopleData.filter((people) =>
        people.name.toLowerCase().includes(everyKeyword))
      //??????second name
    } else if (peopleData.some((people) => people.surname.toLowerCase() === keyword)) {
      filteredPerson = peopleData.filter((people) =>
        people.surname.toLowerCase().includes(keyword))
    }
  }

  //???????????????????????????????????????
  if (filteredPerson.length === 0) {
    return alert(`????????????????????????${keyword} ???????????????????????????`)
  }

  //???????????????
  renderPaginator(filteredPerson.length)
  //??????????????? 1 ??????????????????
  renderPeopleData(getPersonalDataByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //???????????????????????? a ???????????????
  if (event.target.tagName !== 'A') return

  //?????? dataset ????????????????????????
  const page = Number(event.target.dataset.page)
  //????????????
  renderPeopleData(getPersonalDataByPage(page))
})