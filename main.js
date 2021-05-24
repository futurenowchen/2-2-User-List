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
  //計算起始 index 
  const data = filteredPerson.length ? filteredPerson : peopleData
  const startIndex = (page - 1) * personalData_PER_PAGE
  //回傳切割後的新陣列
  return data.slice(startIndex, startIndex + personalData_PER_PAGE)
}

function renderPaginator(amount) {
  //計算總頁數
  const numberOfPages = Math.ceil(amount / personalData_PER_PAGE)
  //製作 template 
  let rawHTML = ''

  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  //放回 HTML
  paginator.innerHTML = rawHTML
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoritePeople')) || []
  const people = peopleData.find((people) => people.id === id)
  if (list.some((people) => people.id === id)) {
    return alert('此人已加入感興趣清單囉！')
  }
  list.push(people)
  localStorage.setItem('favoritePeople', JSON.stringify(list))
}

function removeFromFavorite(id) {
  const list = JSON.parse(localStorage.getItem('favoritePeople'))
  if (!list) return

  //透過 id 找到要刪除人名的 index
  const peopleIndex = list.findIndex((people) => people.id === id)
  if (peopleIndex === -1) return

  //刪除該筆人物資料
  list.splice(peopleIndex, 1)

  //存回 local storage
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
    //沒有搜尋到，回傳所有內容
    if (everyKeyword === '') {
      filteredPerson = peopleData.filter((people) =>
        people.name.toLowerCase().includes(keyword))
      //比對first name
    } else if (peopleData.some((people) => people.name.toLowerCase() === everyKeyword)) {
      filteredPerson = peopleData.filter((people) =>
        people.name.toLowerCase().includes(everyKeyword))
      //比對second name
    } else if (peopleData.some((people) => people.surname.toLowerCase() === keyword)) {
      filteredPerson = peopleData.filter((people) =>
        people.surname.toLowerCase().includes(keyword))
    }
  }

  //錯誤處理：無符合條件的結果
  if (filteredPerson.length === 0) {
    return alert(`您輸入的關鍵字：${keyword} 沒有符合條件的人名`)
  }

  //重製分頁器
  renderPaginator(filteredPerson.length)
  //預設顯示第 1 頁的搜尋結果
  renderPeopleData(getPersonalDataByPage(1))
})

paginator.addEventListener('click', function onPaginatorClicked(event) {
  //如果被點擊的不是 a 標籤，結束
  if (event.target.tagName !== 'A') return

  //透過 dataset 取得被點擊的頁數
  const page = Number(event.target.dataset.page)
  //更新畫面
  renderPeopleData(getPersonalDataByPage(page))
})