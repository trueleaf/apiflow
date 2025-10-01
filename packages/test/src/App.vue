<template>
  <el-container class="app-container">
    <el-main>
      <el-card shadow="hover" class="greeting-card">
        <h1 class="greeting">hello word</h1>
      </el-card>
    </el-main>
  </el-container>
</template>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.greeting-card {
  text-align: center;
  padding: 2rem;
}

.greeting {
  margin: 0;
  font-size: 2rem;
  font-weight: 600;
}
</style>