<template>
  <div>
    <div class="text-body2 q-pt-sm text-right">
      © Copyright 2021-{{ year }}
      <a class="text-nodecoration" href="https://www.ut.ee/en">{{
        $t("university")
      }}</a>
    </div>
  </div>
</template>

<script>
export default {
  name: "Footer",

  components: {},

  data() {
    return {};
  },

  watch: {},

  created() {},

  methods: {},

  computed: {
    // current year
    year: function () {
      const date = new Date();
      let year = date.getFullYear();
      return year;
    },
  },
};
</script>

<style scoped></style>
