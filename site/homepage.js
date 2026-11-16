const filters = document.querySelectorAll('[data-filter]');
const projects = document.querySelectorAll('[data-categories]');
filters.forEach(button => button.addEventListener('click', () => {
  filters.forEach(filter => filter.setAttribute('aria-pressed', String(filter === button)));
  projects.forEach(project => {project.hidden = button.dataset.filter !== 'All' && !project.dataset.categories.split('|').includes(button.dataset.filter);});
}));
