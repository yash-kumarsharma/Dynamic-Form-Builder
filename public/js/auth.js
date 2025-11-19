async function register(){
  const name = document.getElementById('regName').value.trim();
  const email = document.getElementById('regEmail').value.trim();
  const password = document.getElementById('regPass').value;

  try{
    const data = await apiFetch('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password })
    });
    alert('Registered. You may login now.');
    document.getElementById('loginEmail').value = email;
  }catch(err){
    console.error(err);
    alert(err.error || err.message || 'Registration failed');
  }
}

async function login(){
  const email = document.getElementById('loginEmail').value.trim();
  const password = document.getElementById('loginPass').value;
  try{
    const data = await apiFetch('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    if(data.token){
      setToken(data.token);
      // redirect to builder
      window.location = '/views/forms.html';
    } else {
      alert('Login failed');
    }
  }catch(err){
    console.error(err);
    alert(err.error || err.message || 'Login failed');
  }
}

function logout(){
  setToken(null);
  window.location = '/views/index.html';
}
