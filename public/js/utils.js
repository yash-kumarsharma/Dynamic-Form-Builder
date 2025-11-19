// utils.js - helper functions for frontend
const API_BASE = '/api';
const WS_PORT = (window.__WS_PORT__ || 4001);

function getToken(){
  return localStorage.getItem('token') || null;
}
function setToken(t){
  if(t) localStorage.setItem('token', t);
  else localStorage.removeItem('token');
}
async function apiFetch(path, opts = {}){
  const headers = opts.headers || {};
  headers['Content-Type'] = headers['Content-Type'] || 'application/json';
  const token = getToken();
  if(token) headers['Authorization'] = 'Bearer ' + token;
  opts.headers = headers;
  const res = await fetch(API_BASE + path, opts);
  const txt = await res.text();
  let json;
  try { json = JSON.parse(txt); } catch(e) { json = txt; }
  if(!res.ok) throw json;
  return json;
}
function copyToClipboard(text){
  navigator.clipboard?.writeText(text).then(()=>alert('Link copied to clipboard'));
}
function buildShareUrl(shareToken){
  if(!shareToken) return null;
  // route to friendly share page
  return `${location.origin}/views/share.html?token=${shareToken}`;
}
