<template>
  <div class="login-skeleton">
    <div class="login-skeleton__box">
      <div class="login-skeleton__left hidden-md-and-down">
        <div class="login-skeleton__poster">
          <el-skeleton-item variant="image" class="login-skeleton__poster-img" />
        </div>
        <div class="login-skeleton__list">
          <el-skeleton-item v-for="item in 3" :key="`feature-${item}`" variant="text" class="login-skeleton__line" />
        </div>
        <div class="login-skeleton__cta">
          <el-skeleton-item v-for="badge in 2" :key="`badge-${badge}`" variant="button" class="login-skeleton__pill" />
        </div>
      </div>
      <div class="login-skeleton__right">
        <div class="login-skeleton__title">
          <el-skeleton-item variant="text" class="login-skeleton__title-main" />
          <el-skeleton-item variant="text" class="login-skeleton__title-sub" />
        </div>
        <div class="login-skeleton__tabs">
          <el-skeleton-item v-for="tab in 3" :key="`tab-${tab}`" variant="text" class="login-skeleton__tab" />
        </div>
        <div class="login-skeleton__form">
          <el-skeleton-item v-for="field in 3" :key="`field-${field}`" variant="rect" class="login-skeleton__input" />
          <el-skeleton-item variant="rect" class="login-skeleton__button" />
          <el-skeleton-item variant="text" class="login-skeleton__link" />
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.login-skeleton {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  background: var(--gray-200);
  z-index: 1;

  &__box {
    width: 960px;
    height: 550px;
    background: var(--white);
    box-shadow: var(--box-shadow-base);
    border-radius: var(--border-radius-base);
    display: flex;
    overflow: hidden;
  }

  &__left {
    flex: 0 0 50%;
    padding: 32px 28px;
    display: flex;
    flex-direction: column;
    gap: 20px;
    background: linear-gradient(160deg, var(--el-color-primary-light-9), var(--el-color-primary-light-7));
  }

  &__poster {
    width: 100%;
    height: 220px;
    border-radius: var(--border-radius-base);
    overflow: hidden;
  }

  &__poster-img {
    width: 100%;
    height: 100%;
    border-radius: var(--border-radius-base);
  }

  &__list {
    display: grid;
    gap: 12px;
  }

  &__line {
    height: 14px;
    width: 80%;
  }

  &__cta {
    display: flex;
    gap: 12px;
    margin-top: auto;
  }

  &__pill {
    flex: 1;
    height: 40px;
    border-radius: 999px;
  }

  &__right {
    flex: 1;
    padding: 32px 40px;
    display: flex;
    flex-direction: column;
    gap: 18px;
    justify-content: center;
  }

  &__title {
    display: grid;
    gap: 8px;
  }

  &__title-main {
    height: 26px;
    width: 60%;
  }

  &__title-sub {
    height: 16px;
    width: 30%;
  }

  &__tabs {
    display: flex;
    gap: 12px;
  }

  &__tab {
    width: 88px;
    height: 20px;
  }

  &__form {
    display: grid;
    gap: 12px;
    margin-top: 8px;
  }

  &__input {
    height: 46px;
    border-radius: 10px;
  }

  &__button {
    height: 44px;
    border-radius: 10px;
  }

  &__link {
    height: 14px;
    width: 40%;
  }
}
</style>
