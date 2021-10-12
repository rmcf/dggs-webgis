<template>
  <q-layout view="hHh Lpr fFf">
    <q-header elevated class="bg-grey-1 text-grey-8">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />

        <q-toolbar-title> DGGS web-GIS </q-toolbar-title>

        <div>SPA</div>
      </q-toolbar>
    </q-header>

    <!-- drawer -->
    <q-drawer v-model="leftDrawerOpen" show-if-above bordered>
      <q-list class="q-mt-lg">
        <q-item
          to="/"
          exact
          clickable
          v-ripple
          :active="link === 'about'"
          @click="link = 'about'"
          active-class="active-link"
        >
          <q-item-section avatar>
            <q-icon name="info_outline" />
          </q-item-section>

          <q-item-section>About</q-item-section>
        </q-item>

        <q-item
          to="/map"
          exact
          clickable
          v-ripple
          :active="link === 'map'"
          @click="link = 'map'"
          active-class="active-link"
        >
          <q-item-section avatar>
            <q-icon name="public" />
          </q-item-section>

          <q-item-section>Map</q-item-section>
        </q-item>
      </q-list>
      <!-- <q-list>
        <q-item-label header> Essential Links </q-item-label>

        <EssentialLink
          v-for="link in essentialLinks"
          :key="link.title"
          v-bind="link"
        />
      </q-list> -->
    </q-drawer>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script>
// import EssentialLink from "components/EssentialLink.vue";

// const linksList = [
//   {
//     title: "Docs",
//     caption: "quasar.dev",
//     icon: "school",
//     link: "https://quasar.dev",
//   },
//   {
//     title: "Github",
//     caption: "github.com/quasarframework",
//     icon: "code",
//     link: "https://github.com/quasarframework",
//   },
//   {
//     title: "Discord Chat Channel",
//     caption: "chat.quasar.dev",
//     icon: "chat",
//     link: "https://chat.quasar.dev",
//   },
//   {
//     title: "Forum",
//     caption: "forum.quasar.dev",
//     icon: "record_voice_over",
//     link: "https://forum.quasar.dev",
//   },
//   {
//     title: "Twitter",
//     caption: "@quasarframework",
//     icon: "rss_feed",
//     link: "https://twitter.quasar.dev",
//   },
//   {
//     title: "Facebook",
//     caption: "@QuasarFramework",
//     icon: "public",
//     link: "https://facebook.quasar.dev",
//   },
//   {
//     title: "Quasar Awesome",
//     caption: "Community Quasar projects",
//     icon: "favorite",
//     link: "https://awesome.quasar.dev",
//   },
// ];

import { ref } from "vue";

export default {
  name: "MainLayout",

  components: {
    // EssentialLink,
  },

  data() {
    return {
      leftDrawerOpen: false,
      color: "",
      link: "home",
    };
  },

  // setup() {
  //   const leftDrawerOpen = ref(false);

  //   return {
  //     essentialLinks: linksList,
  //     leftDrawerOpen,
  //     toggleLeftDrawer() {
  //       leftDrawerOpen.value = !leftDrawerOpen.value;
  //     },
  //   };
  // },
};
</script>

<style lang="scss" scoped>
.active-link {
  background-color: $grey-3;
  color: black;
}
</style>

<style lang="scss">
.q-page {
  padding: 2rem;
}
</style>
