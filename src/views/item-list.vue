<template>
  <div class="news-view">
    <div class="news-list-nav">
      <router-link v-if="page > 1" :to="'/' + type + '/' + (page - 1)">&lt; prev</router-link>
      <a v-else class="disabled">&lt; prev</a>
      <span>{{ page }}/{{ maxPage }}</span>
      <router-link v-if="hasMore" :to="'/' + type + '/' + (page + 1)">more &gt;</router-link>
      <a v-else class="disabled">more &gt;</a>
    </div>
    <transition :name="transition">
      <div class="news-list" :key="displayedPage" v-if="displayedPage > 0">
        <transition-group tag="ul" name="item">
          <item v-for="item in displayedItems" :key="item.id" :item="item">
          </item>
        </transition-group>
      </div>
    </transition>
  </div>
</template>

<script lang="ts">
import { watchList } from '../api';
import Item from '../components/item.vue';

export default {
  name: 'item-list',

  components: {
    Item,
  },

  props: {
    type: String,
  },

  data () {
    return {
      transition: 'slide-right',
      displayedPage: Number(this.$store.state.route.params.page) || 1,
      displayedItems: this.$store.getters.activeItems,
    };
  },

  computed: {
    page () {
      return Number(this.$store.state.route.params.page) || 1;
    },

    maxPage () {
      const { itemsPerPage, lists } = this.$store.state;

      return Math.ceil(lists[this.type].length / itemsPerPage);
    }

    hasMore () {
      return this.page < this.maxPage;
    },
  },

  beforeMount () {
    if (this.$root._isMounted) {
      this.loadItems(this.page);
    }

    // Watch the current list for realtime updates
    this.unwatchList = watchList(
      this.type,
      ids => {
        this.$store.commit('SET_LIST', { type: this.type, ids });
      },
    );
  },

  beforeDestroy () {
    this.unwarchList();
  },

  watch: {
    page (to: number, from: number) {
      this.loadItems(to, from);
    },
  },

  methods: {
    async loadItems (to: number = this.page, from: number = -1) {
      this.$bar.start();
      await this.$store.dispatch('FETCH_LIST_DATA', {
        type: this.type,
      });
      if (this.page < 0 || this.page > this.maxPage) {
        this.$router.replace(`/${this.type}/1`);
        return;
      }
      this.transition = from === -1
        ? null
        : to > from ? 'slide-left' : 'slide-right';
      this.displayedPage = to;
      this.displayedItems = this.$store.getters.activeItems;
      this.$bar.finish();
    }
  },
}
</script>

