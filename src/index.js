import 'bootstrap/dist/css/bootstrap.min.css';
import 'loaders.css/loaders.min.css';
import { watch } from 'melanke-watchjs/';
import axios from 'axios';
import parse from './parse';
import { renderChannelList, renderArticleList } from './renders';
import {
  showAlert, removeAlert, validator, showLoader, removeLoader,
} from './utils';


const app = () => {
  const state = {
    urlFeeds: [],
    loading: false,
    error: null,
    form: { valid: null },
    feeds: {
      channels: [],
      items: [],
    },
    request: null,
  };

  const inputFeedURL = document.querySelector('#inputFeedURL');
  inputFeedURL.addEventListener('input', () => {
    const newFeed = inputFeedURL.value;
    state.form.valid = validator(newFeed, state.urlFeeds);
  });

  const btnAddFeed = document.querySelector('#btnAddFeed');
  btnAddFeed.addEventListener('click', () => {
    const newFeed = inputFeedURL.value;
    if (newFeed.length === 0) {
      state.form.valid = false;
      return;
    }
    const corsProxy = 'https://cors-anywhere.herokuapp.com/';
    const urlWithProxy = `${corsProxy}${newFeed}`;
    state.loading = true;
    state.error = null;
    axios.get(urlWithProxy).then((res) => {
      state.loading = false;
      state.urlFeeds.push(newFeed);
      const { items, channelTitle, channelDesc } = parse(res.data);
      state.feeds.channels.push({ channelTitle, channelDesc });
      state.feeds.items.push(...items);
    }).catch((error) => {
      state.loading = false;
      state.error = error.message;
    });
  });

  const formAddFeed = document.querySelector('#formAddFeed');
  formAddFeed.addEventListener('submit', (e) => {
    btnAddFeed.click();
    e.preventDefault();
  });

  watch(state, 'form', () => {
    if (state.form.valid) {
      inputFeedURL.classList.add('is-valid');
      inputFeedURL.classList.remove('is-invalid');
      btnAddFeed.removeAttribute('disabled', '');
    } else {
      inputFeedURL.classList.remove('is-valid');
      inputFeedURL.classList.add('is-invalid');
      btnAddFeed.setAttribute('disabled', '');
    }
  });

  watch(state, 'loading', () => {
    if (state.loading) {
      removeAlert();
      showLoader();
      inputFeedURL.setAttribute('disabled', '');
      btnAddFeed.setAttribute('disabled', '');
    } else if (state.error) {
      removeLoader();
      inputFeedURL.removeAttribute('disabled', '');
      btnAddFeed.removeAttribute('disabled', '');
      showAlert('danger', state.error);
    } else {
      removeLoader();
      inputFeedURL.value = '';
      inputFeedURL.removeAttribute('disabled', '');
      btnAddFeed.removeAttribute('disabled', '');
      showAlert('success', 'Feed added successfully');
    }
  });

  watch(state, 'feeds', () => {
    renderChannelList(state.feeds.channels);
    renderArticleList(state.feeds.items);
  });
};

app();
