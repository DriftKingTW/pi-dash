<template>
  <v-app>
    <v-app-bar app color="primary" dark dense flat clipped-right>
      <div class="d-flex align-center">
        <v-toolbar-title> Pi Dash </v-toolbar-title>
      </div>
      <span v-if="debug" class="ml-4 font-weight-black warning--text">
        <v-icon small left color="warning">
          mdi-application-brackets-outline
        </v-icon>
        Debug Mode
      </span>
      <v-spacer></v-spacer>
    </v-app-bar>

    <nav>
      <router-link to="/">Home</router-link> |
      <router-link to="/about">About</router-link>
    </nav>

    <v-main>
      <router-view :key="routerViewKey" />
    </v-main>
  </v-app>
</template>