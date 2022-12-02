///Variable declaration
const BASE_URL = "https://lighthouse-user-api.herokuapp.com";
const INDEX_URL = BASE_URL + "/api/v1/users/";
const paginator = document.querySelector(".pagination")
const users = [];
const data_panel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form")
const searchInput = document.querySelector("#search-input")
const genderList = document.querySelector("#filtered-by-gender")
let filteredName = []
const users_per_page = 30
let totalPage; 
let currentPage = 1;

/// get data from index API
axios
  .get(INDEX_URL)
  .then((response) => {
    // array(200)
    // console.log(response.data.results);
    users.push(...response.data.results);
    // console.log(users)
    //render user list with users data
    renderUserList(users);
    renderGenderFilter(users)
    renderPaginator(users.length)
    renderUserList(getUsersByPage(1))
    pageActiveStatus("1")
  })
  .catch((error) => {
    console.log(error);
  });
///Eventlisteners
// Listen to data panel
data_panel.addEventListener("click", (event) => {
  if (event.target.matches("#avatar")) {
    showUserModal(event.target.dataset.userId);
  } else if (event.target.matches("#save")) {
    addToFavorite(Number(event.target.dataset.userId))
  }
});
//Listen to gender select
genderList.addEventListener("change", function (event) {
  selectGender(event.target.value)
})
//Listen to search form
searchForm.addEventListener("keyup", function onSearchFormSubmitted(event) {
  // event.preventDefault() 
  const keyword = searchInput.value.trim().toLowerCase()
  if (keyword.length === 0 || !keyword.length) {
    renderUserList(getUsersByPage(1))
  }
  filteredName = users.filter(function (user) {
    return (user.name + " " + user.surname).toLowerCase().includes(keyword)
  })
  if (filteredName.length === 0) {
    return alert(`${keyword} is not in the list!`)
  }
  renderPaginator(filteredName.length)
  renderUserList(getUsersByPage(1))
})
// prevent default when pressing enter key
searchForm.addEventListener('submit', function (event) {
  event.preventDefault()
})
//listen to paginator
paginator.addEventListener("click", pageChange)

///Functions
//Function: Render gender filter
function renderGenderFilter(data){
  const selectedGender = data.map(user => {return user.gender})
  // remove duplicate
  const allGenderList = selectedGender.filter(function(value, index, array){
    return array.indexOf(value) === index
  })
  console.log(allGenderList)
  let selectedGenderList = ""
  selectedGenderList += `<option value="all">- Select gender -</option>`
  allGenderList.forEach((i) => {
    selectedGenderList += ` <option value="${i}">${i}</option>`;
  })
  genderList.innerHTML = selectedGenderList
}
// Function: Select gender
function selectGender(gender){
  filteredName = gender === 'all' ? users : users.filter(item => item.gender === gender);
  renderPaginator(filteredName.length)
  renderUserList(getUsersByPage(1))
  pageActiveStatus("1")
}


//Function: Render user list
function renderUserList(data) {
  let htmlContent = "";
  data.forEach((item) => {
    htmlContent += `
   <div class="col-md-2  mx-3 my-3">
        <div class="card w-100 h-100" data-user-id="${item.id}">
         <img src="${item.avatar}" class="card-img-top rounded img-fluid" id="avatar" alt="..." style="cursor: pointer;" data-bs-toggle="modal" data-bs-target="#user-modal" data-user-id="${item.id}">
          <div class="card-body d-flex">
            <div class="card-text" data-user-id="${item.id}">${item.name} ${item.surname}</div>
          <div class="me-0" id="fav-button"><button type="button" class="btn btn-outline-danger btn-sm m-1" id="save" data-bs-toggle="tooltip" data-bs-placement="top" title="Save" data-user-id="${item.id}"><i class="fa-regular fa-heart" id="save" data-user-id="${item.id}"></i></button></div>
          </div>
        </div>
      </div>
  `;
  });
  data_panel.innerHTML = htmlContent;
}

//Function: Pop-up modal with user details
function showUserModal(id) {
  const modalTitle = document.querySelector(".modal-title");
  const modalImage = document.querySelector("#user-modal-image");
  const modalEmail = document.querySelector("#email");
  const modalGender = document.querySelector("#gender");
  const modalAge = document.querySelector("#age");
  const modalRegion = document.querySelector("#region");
  const modalBirthday = document.querySelector("#birthday");
  // 先將 modal 內容清空，以免出現上一個 user 的資料殘影
  modalTitle.innerText = "";
  modalEmail.innerText = "";
  modalGender.innerText = "";
  modalAge.innerText = "";
  modalRegion.innerText = "";
  modalBirthday.innerText = "";
  modalImage.innerHTML = "";

  axios.get(INDEX_URL + id).then((response) => {
    const data = response.data;
    modalTitle.innerText = data.name + " " + data.surname;
    modalEmail.innerText = "E-mail:" + " " + data.email;
    modalGender.innerText = "Gender:" + " " + data.gender;
    modalAge.innerText = "Age:" + " " + data.age;
    modalRegion.innerText = "Region:" + " " + data.region;
    modalBirthday.innerText = "Birthday:" + " " + data.birthday;
    modalImage.innerHTML = ` <img src="${data.avatar}"  alt="user-avatar" class="rounded-circle mx-auto" style="max-width: 50%"> `;
  });
}

//Function: Add to favorite
function addToFavorite(ID) {
  const list = JSON.parse(localStorage.getItem('favoriteList')) || []
  const friend = users.find(user => user.id === ID)
  if (list.some(user => user.id === ID)) {
    return alert(`User ${friend.name} ${friend.surname} is already in your favorite list!`)
  }
  list.push(friend)
  localStorage.setItem('favoriteList', JSON.stringify(list))
}

//Function: slice data
function getUsersByPage(page) {
  let data = filteredName.length ? filteredName : users
  const startIndex = (page - 1) * users_per_page
  return data.slice(startIndex, startIndex + users_per_page)
}

// Function: render paginator
function renderPaginator(amount) {
  totalPage = Math.ceil(amount / users_per_page)
  let rawHTML = ''
  
  for (let page = 1; page <= totalPage; page++) {
    rawHTML += `<li class="page-item"><a class="page-link page-number" data-page="${page}">${page}</a></li>`
  }
  paginator.innerHTML = rawHTML
  
}
// Function: change page
function pageChange(event){
  const page = event.target.dataset.page
  currentPage = 1
  if (event.target.tagName !== 'A') return
  if (event.target.classList.contains("page-number")){
    renderUserList(getUsersByPage(page))
    pageActiveStatus(page)
  }
}
//Function: active page
function pageActiveStatus(Page){
  //active status
  let activePage = document.querySelectorAll(".active");
  if (activePage) {
    activePage.forEach((item) => {
      item.classList.remove("active");
    });
  }
  let clickPage = document.querySelectorAll(".page-number")
  clickPage.forEach((item)=>{
    if (item.dataset.page === Page){
       item.parentElement.classList.add("active")
    }
  })
}

