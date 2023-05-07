import './css/common.css';
import ImagesApiService from './js/image-service';
import LoadMoreBtn from './js/load-more-btn';
import Notiflix from 'notiflix';
import SimpleLightbox from 'simplelightbox';
import 'simplelightbox/dist/simple-lightbox.min.css';

var lightbox = new SimpleLightbox('.gallery a', {
  captions: true,
  captionSelector: 'img',
  captionType: 'attr',
  captionsData: 'alt',
  captionPosition: 'bottom',
  captionDelay: 250,
});

const refs = {
  searchForm: document.querySelector('.search-form'),
  imagesList: document.querySelector('.gallery'),
};

const loadMoreBtn = new LoadMoreBtn({
  selector: '.load-more',
  hidden: true,
});

const imagesApiService = new ImagesApiService();

refs.searchForm.addEventListener('submit', onSearch);
loadMoreBtn.button.addEventListener('click', onLoadMore);

function onSearch(e) {
  e.preventDefault();
  clearImagesContainer();

  imagesApiService.query = e.currentTarget.elements.searchQuery.value;
  imagesApiService.resetPage();
  console.log(imagesApiService.query);
  if (imagesApiService.query === '') {
    return Notiflix.Notify.failure('What do you want to find?');
  }

  fetchImages();
}

function onLoadMore() {
  fetchImages();
  smoothScrolling();
}

async function fetchImages() {
  const images = await imagesApiService.fetchImages();

  if (images.totalHits === 0) {
    Notiflix.Notify.failure(
      'Sorry, there are no images matching your search query. Please try again.'
    );
    loadMoreBtn.hide();
  } else {
    renderImages(images.hits);
    if (imagesApiService.page === 2) {
      Notiflix.Notify.success(`Hooray! We found ${images.totalHits} images.`);
    }
    if (images.totalHits <= (imagesApiService.page - 1) * 40) {
      Notiflix.Notify.info(
        "We're sorry, but you've reached the end of search results."
      );
      loadMoreBtn.hide();
    } else {
      loadMoreBtn.show();
    }
  }
}

function renderImages(images) {
  const markup = images
    .map(
      ({
        webformatURL,
        largeImageURL,
        tags,
        likes,
        views,
        comments,
        downloads,
      }) => {
        return `<li class="photo-card">
        <a href="${largeImageURL}">
        <img src="${webformatURL}" alt="${tags}" loading="lazy" width="450" />
        </a>
        <div class="info">
            <p class="info-item">
            <b>Likes</b>
            ${likes}
            </p>
            <p class="info-item">
            <b>Views</b>
            ${views}
            </p>
            <p class="info-item">
            <b>Comments</b>
            ${comments}
            </p>
            <p class="info-item">
            <b>Downloads</b>
            ${downloads}
            </p>
        </div>
        </li>`;
      }
    )
    .join('');

  refs.imagesList.insertAdjacentHTML('beforeend', markup);

  lightbox.refresh();
}

function clearImagesContainer() {
  refs.imagesList.innerHTML = '';
}

function smoothScrolling() {
  const { height: cardHeight } = document
    .querySelector('.gallery')
    .firstElementChild.getBoundingClientRect();

  window.scrollBy({
    top: cardHeight * 2,
    behavior: 'smooth',
  });
}
