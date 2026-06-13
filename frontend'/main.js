// Your existing JS code stays EXACTLY THE SAME
const API="https://gymtracker-gx6e.onrender.com/api";
let selectedUser=null;

/* ---------- AUTH ---------- */
function showLogin(){registerBox.classList.add("hidden");loginBox.classList.remove("hidden");loginBox.classList.add("active")}
function showRegister(){loginBox.classList.add("hidden");registerBox.classList.remove("hidden");registerBox.classList.add("active")}

function register(){
  const btn = event.target;
  btn.innerHTML = "Registering...";
  btn.classList.add("loading");
  
fetch(API+"/register/",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
username:r_username.value,
password:r_password.value,
role:r_role.value
})
}).then(r=>r.json()).then(d=>{
regMsg.innerText=d.error||"Registered successfully";
regMsg.className = d.error ? "msg error shake" : "msg success";
btn.innerHTML = "Register";
btn.classList.remove("loading");
if(!d.error)setTimeout(showLogin,800)
})
}

function login(){
  const btn = event.target;
  btn.innerHTML = "Logging in...";
  btn.classList.add("loading");
  
fetch(API+"/login/",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
username:l_username.value,
password:l_password.value
})
}).then(r=>r.json()).then(d=>{
btn.innerHTML = "Login";
btn.classList.remove("loading");
if(d.error){logMsg.innerText=d.error;logMsg.className="msg error shake";return}
localStorage.setItem("username",d.username)
localStorage.setItem("role",d.role)
openDashboard()
})
}

/* ---------- DASHBOARD ---------- */
function openDashboard(){
registerBox.classList.add("hidden")
loginBox.classList.add("hidden")

const role=localStorage.getItem("role")
const user=localStorage.getItem("username")

if(role==="admin"){
adminDashboard.classList.remove("hidden")
adminName.innerText=user
loadAdminJoinRequests()
}
else if(role==="trainer"){
trainerDashboard.classList.remove("hidden")
trainerName.innerText=user
loadTrainerUsers()
}
else{
userDashboard.classList.remove("hidden")
userName.innerText=user
loadUserStatus()
}
}

/* ---------- ADMIN ---------- */
function loadAdminJoinRequests(){
fetch(API+"/gym/admin/join-requests/")
.then(r=>r.json()).then(data=>{
adminJoinList.innerHTML=""
data.forEach(r=>{
adminJoinList.innerHTML+=`
<li>
<b>${r.username}</b> | ${r.gym_type}<br>
<input id="t_${r.username}" placeholder="trainer username">
<button onclick="approveUser('${r.username}')">Approve</button>
</li>`
})
})
}

function approveUser(user){
const trainer=document.getElementById("t_"+user).value
fetch(API+"/gym/admin/approve/",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({user:user,trainer:trainer})
}).then(r=>r.json()).then(d=>{
alert(d.message||d.error)
loadAdminJoinRequests()
})
}

/* ---------- TRAINER ---------- */
function loadTrainerUsers(){
fetch(API+"/gym/trainer/users/"+localStorage.getItem("username")+"/")
.then(r=>r.json()).then(data=>{
trainerUsers.innerHTML=""
data.forEach(u=>{
trainerUsers.innerHTML+=`
<li onclick="selectUser('${u.username}')">
<b>${u.username}</b>
</li>`
})
})
}

function selectUser(u){
selectedUser=u
trainerActions.classList.remove("hidden")
selectedUserTitle.innerText="Daily update for: "+u
}

function submitDailyUpdate(){
fetch(API+"/gym/trainer/daily-update/",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
trainer:localStorage.getItem("username"),
user:selectedUser,
workout:t_workout.value,
diet:t_diet.value,
present:t_present.value==="true"
})
}).then(r=>r.json()).then(d=>{
trainerMsg.innerText=d.message||d.error
trainerMsg.className = d.message ? "msg success" : "msg error";
t_workout.value=""
t_diet.value=""
})
}

/* ---------- USER ---------- */
function joinGym(){
fetch(API+"/gym/join/",{
method:"POST",headers:{"Content-Type":"application/json"},
body:JSON.stringify({
username:localStorage.getItem("username"),
age:age.value,
height:height.value,
weight:weight.value,
gym_type:gym_type.value
})
}).then(r=>r.json()).then(d=>joinMsg.innerText=d.message||d.error)
}

function loadUserStatus(){
const u=localStorage.getItem("username")
fetch(API+"/gym/user/status/"+u+"/")
.then(r=>r.json()).then(d=>{
if(!d.approved){
statusText.innerText="⏳ Pending approval"
}
else{
statusText.innerText="✅ Approved"
trainerText.innerText="Trainer: "+d.trainer
joinCard.classList.add("hidden")
loadUserProgress()
}
})
}

function loadUserProgress(){
fetch(API+"/gym/user/progress/"+localStorage.getItem("username")+"/")
.then(r=>r.json()).then(data=>{
progressCard.classList.remove("hidden")
progressList.innerHTML=""
data.forEach(r=>{
progressList.innerHTML+=`
<li>
<b>${r.date}</b><br>
Workout: ${r.workout}<br>
Diet: ${r.diet}<br>
Attendance: ${r.present ? "Present" : "Absent"}<br>
<small>Trainer: ${r.trainer}</small>
</li>`
})
})
}

/* ---------- COMMON ---------- */
function logout(){
localStorage.clear()
location.reload()
}

if(localStorage.getItem("username"))openDashboard()


// subscription

