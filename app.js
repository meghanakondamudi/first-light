const fallbackStories = [
  { category: 'World', title: 'At the UN, a new push for practical cooperation on climate and conflict', source: 'UN News', url: 'https://news.un.org/' },
  { category: 'India', title: 'States look to local manufacturing as the next growth engine', source: 'The Hindu', url: 'https://www.thehindu.com/' },
  { category: 'Business', title: 'Markets weigh a cautious turn as central banks read the next signal', source: 'Reuters', url: 'https://www.reuters.com/' },
  { category: 'Sports', title: 'The season’s young players are changing how the game is played', source: 'ESPN', url: 'https://www.espn.com/' },
  { category: 'Tech', title: 'The global conversation around AI is becoming a conversation about work', source: 'MIT Technology Review', url: 'https://www.technologyreview.com/' },
  { category: 'World', title: 'Cities are quietly rewriting the rules for a hotter, busier century', source: 'The Guardian', url: 'https://www.theguardian.com/international' }
];

const fallbackEssays = [
  { type: 'Literature', title: 'The art of paying attention', summary: 'On the slow, strange pleasure of reading a sentence until it opens a door you did not know was there.', author: 'Hermione Lee', source: 'The New York Review of Books', url: 'https://www.nybooks.com/' },
  { type: 'Ideas', title: 'What a resilient city looks like', summary: 'The places adapting fastest to a changing climate are redesigning the everyday, not waiting for a grand plan.', author: 'David Wallace-Wells', source: 'The Atlantic', url: 'https://www.theatlantic.com/' }
];

let stories = fallbackStories;
const weatherSymbols = { clear: '☼', cloudy: '◒', rain: '☂', snow: '❄', storm: 'ϟ' };

const list = document.querySelector('#headlineList');
const count = document.querySelector('#headlineCount');
const toast = document.querySelector('#toast');

function renderStories(filter = 'All') {
  const visible = filter === 'All' ? stories : stories.filter((story) => story.category === filter);
  count.textContent = `${visible.length} ${visible.length === 1 ? 'story' : 'stories'}`;
  list.innerHTML = visible.map((story) => `<a class="headline" href="${story.url}" target="_blank" rel="noreferrer"><span class="headline-category">${story.category}</span><h3>${story.title}</h3><span class="headline-source">${story.source}</span><span class="headline-arrow">↗</span></a>`).join('');
}

function renderWeather(id, place) {
  const card = document.querySelector(`#${id}`);
  if (!place || !card) return;
  const condition = place.condition || 'Clear skies';
  card.querySelector('.weather-symbol').textContent = weatherSymbols[place.kind] || '☼';
  card.querySelector('.temperature strong').textContent = `${Math.round(place.temperature)}°`;
  card.querySelector('.temperature span').innerHTML = `${condition}<br /><small>Feels like ${Math.round(place.apparent)}°</small>`;
  const values = card.querySelectorAll('.weather-meta b');
  values[0].textContent = `${Math.round(place.humidity)}%`;
  values[1].textContent = `${Math.round(place.wind)} km/h`;
  values[2].textContent = `${Math.round(place.high)}°`;
}

function renderEssays(essays = fallbackEssays) {
  essays.slice(0, 2).forEach((essay, index) => {
    const card = document.querySelector(index === 0 ? '#literatureEssay' : '#ideasEssay');
    if (!card || !essay) return;
    card.querySelector('.essay-type').textContent = essay.type;
    card.querySelector('h3').textContent = essay.title;
    card.querySelector('p').textContent = essay.summary;
    card.querySelector('.essay-footer span').textContent = `By ${essay.author}`;
    const link = card.querySelector('.essay-footer a');
    link.href = essay.url;
    link.textContent = `Read at ${essay.source} ↗`;
  });
}

function updateDates(dateValue) {
  const date = dateValue ? new Date(`${dateValue}T12:00:00`) : new Date();
  const weekday = date.toLocaleDateString('en-US', { weekday: 'long' });
  const shortWeekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateText = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
  document.querySelector('#briefingDate').textContent = date.toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric', weekday: 'long' });
  document.querySelector('#currentDate').textContent = dateText;
  document.querySelector('.date-label').textContent = shortWeekday;
  document.querySelector('#footerDate').textContent = date.toLocaleDateString('en-GB').replaceAll('/', '.');
  document.querySelector('#issueNumber').textContent = `Issue ${String(date.getDate()).padStart(3, '0')}`;
  return { date, weekday };
}

async function loadBriefing() {
  try {
    const response = await fetch(`data.json?${Date.now()}`);
    if (!response.ok) throw new Error('Briefing data unavailable');
    const data = await response.json();
    stories = data.headlines?.length ? data.headlines : fallbackStories;
    renderStories(document.querySelector('.filter.active').dataset.filter);
    renderEssays(data.essays);
    renderWeather('tenaliWeather', data.weather?.tenali);
    renderWeather('genevaWeather', data.weather?.geneva);
    updateDates(data.updatedAt);
  } catch (error) {
    updateDates();
  }
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    button.classList.add('active');
    renderStories(button.dataset.filter);
  });
});

document.querySelector('#refreshButton').addEventListener('click', () => {
  loadBriefing();
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
});

let dayOffset = 0;
document.querySelector('#previousDay').addEventListener('click', () => { dayOffset -= 1; const date = new Date(); date.setDate(date.getDate() + dayOffset); updateDates(date.toISOString().slice(0, 10)); });
document.querySelector('#nextDay').addEventListener('click', () => { dayOffset += 1; const date = new Date(); date.setDate(date.getDate() + dayOffset); updateDates(date.toISOString().slice(0, 10)); });
renderStories();
renderEssays();
loadBriefing();
