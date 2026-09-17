const stories = [
  { category: 'World', title: 'At the UN, a new push for practical cooperation on climate and conflict', source: 'UN News', url: 'https://news.un.org/' },
  { category: 'India', title: 'States look to local manufacturing as the next growth engine', source: 'The Hindu', url: 'https://www.thehindu.com/' },
  { category: 'Business', title: 'Markets weigh a cautious turn as central banks read the next signal', source: 'Reuters', url: 'https://www.reuters.com/' },
  { category: 'Sports', title: 'The season’s young players are changing how the game is played', source: 'ESPN', url: 'https://www.espn.com/' },
  { category: 'Tech', title: 'The global conversation around AI is becoming a conversation about work', source: 'MIT Technology Review', url: 'https://www.technologyreview.com/' },
  { category: 'World', title: 'Cities are quietly rewriting the rules for a hotter, busier century', source: 'The Guardian', url: 'https://www.theguardian.com/international' }
];

const list = document.querySelector('#headlineList');
const count = document.querySelector('#headlineCount');
const toast = document.querySelector('#toast');

function renderStories(filter = 'All') {
  const visible = filter === 'All' ? stories : stories.filter((story) => story.category === filter);
  count.textContent = `${visible.length} ${visible.length === 1 ? 'story' : 'stories'}`;
  list.innerHTML = visible.map((story) => `<a class="headline" href="${story.url}" target="_blank" rel="noreferrer"><span class="headline-category">${story.category}</span><h3>${story.title}</h3><span class="headline-source">${story.source}</span><span class="headline-arrow">↗</span></a>`).join('');
}

document.querySelectorAll('.filter').forEach((button) => {
  button.addEventListener('click', () => {
    document.querySelector('.filter.active').classList.remove('active');
    button.classList.add('active');
    renderStories(button.dataset.filter);
  });
});

document.querySelector('#refreshButton').addEventListener('click', () => {
  renderStories(document.querySelector('.filter.active').dataset.filter);
  toast.classList.add('show');
  window.setTimeout(() => toast.classList.remove('show'), 1800);
});

let dayOffset = 0;
function updateDate() {
  const date = new Date(2026, 8, 17 + dayOffset);
  const weekday = date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase();
  const dateText = date.toLocaleDateString('en-US', { day: '2-digit', month: 'short' }).toUpperCase();
  document.querySelector('.date-label').textContent = weekday;
  document.querySelector('#currentDate').textContent = dateText;
}
document.querySelector('#previousDay').addEventListener('click', () => { dayOffset -= 1; updateDate(); });
document.querySelector('#nextDay').addEventListener('click', () => { dayOffset += 1; updateDate(); });
renderStories();
