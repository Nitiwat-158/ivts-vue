<template>
    <div>
        <CModal
            add-content-classes="bg-login"
            :show.sync="isAuthe"
            :centered="true"
        >
          <template #header-wrapper>
            <div class="mb-5"></div>
          </template>
          <template #body-wrapper>
            <CRow class="justify-content-center ">
              <CCol col="8">
                <CForm >
                  <CRow >
                    <CCol class="text-center">
                      <img src="@/assets/logo.svg" height="120px"/>
                    </CCol>
                  </CRow>

                  <CRow class=" mt-2">
                    <CCol>
                      <p class="font-weight-bold">{{ $t('auth.signIn.contactTitle') }}</p>
                      <p>{{ $t('auth.signIn.contactText') }}</p>
                      <p>{{ $t('auth.signIn.contactPhone') }}</p>


<!--                      <p class="font-weight-bold">2. คู่มือสมรรถนะ (Competency Dictionary) </p>-->
<!--                      <span>Thai Version  "Click Here" <a class="font-weight-bold" target="_blank" href="https://drive.google.com/file/d/1obIc3c5kEJ6nP1rBH5uA9nvw62fjzTid/view?usp=sharing ">"Click Here"</a></span> <br>-->
<!--                      <span> English Version "Click Here"<a class="font-weight-bold" target="_blank" href="https://drive.google.com/file/d/1Ds3wv_QlPoA_M10i2snrzrh5Ri_Qi9wQ/view?usp=sharing ">"Click Here"</a></span>-->

<!--                      <p class="font-weight-bold mt-4">3. คู่มือการใช้งานระบบ (User Manual) </p>-->
<!--                      <span>Thai Version  "Click Here" <a class="font-weight-bold" target="_blank" href="https://drive.google.com/file/d/1YJxsIbrhgp9tsfz-neHuEDC39mgUpWqg/view?usp=sharing">"Click Here"</a></span> <br>-->
<!--                      <span> English Version "Click Here" <a class="font-weight-bold" target="_blank" href="https://drive.google.com/file/d/1dGYb9s9X1WVuPwEWW3xaScCUEsODxwkA/view?usp=sharing">"Click Here"</a></span>-->


<!--                      <p class="font-weight-bold mt-4">4.แจ้งปัญหาการเข้าใช้ระบบ Usage Issue Reporting Form <a class="font-weight-bold" target="_blank" href="https://docs.google.com/forms/d/e/1FAIpQLSec2LSaDE1flmQULhl7bsCbTOZl4nd1VGfSv3LDxP7bnuZ9iQ/viewform ">"Click Here"</a></p>-->

                    </CCol>
                  </CRow>

                  <CRow>
                    <CCol>
                      <CDropdownDivider class="mt-2"/>
                    </CCol>
                    <label class="text-white font-weight-bold">{{ $t('auth.signIn.socialTitle') }}</label>
                    <CCol>
                      <CDropdownDivider class="mt-2"/>
                    </CCol>
                  </CRow>
                  <CRow>
                    <CCol class="text-center">
                      <div style="cursor: pointer">
<!--                        <img class="mr-2 zoom" src="@/assets/icons/logo-facebook.png" width="50px"/>-->
                        <img class="zoom" @click="onAuthenGoogle" src="@/assets/icons/logo-google.png" width="50px"/>
<!--                        <CButton color="danger" @click="onAuthenGoogle" shape="pill" >-->
<!--                          <samp class="pl-2 pr-2">Login with MFU Mail</samp>-->
<!--                        </CButton>-->

                      </div>
                    </CCol>
                  </CRow>
                </CForm>
              </CCol>
            </CRow>
          </template>
          <template #footer-wrapper>
            <div class="mb-5"></div>
          </template>
        </CModal>
    </div>
</template>

<script>

    import {mapGetters} from 'vuex'

    export default {
        name: 'SignIn',
        methods: {
          async onAuthenGoogle() {
            try {
              if (this.$gAuth && typeof this.$gAuth.load === 'function') {
                await this.$gAuth.load()
              }

              const googleUser = await this.$gAuth.signIn();
              const authResponse = googleUser && typeof googleUser.getAuthResponse === 'function'
                ? googleUser.getAuthResponse()
                : {};
              const id_token = authResponse && authResponse.id_token ? authResponse.id_token : '';

              if (!id_token) {
                throw new Error('missing_google_id_token')
              }

              const body = {
                token: id_token,
                authType: "689c06d5255db4e56aea8902"
              };
              await this.$store.dispatch("auth/signIn", body)

            } catch (err) {
              console.error('Google sign-in failed:', err)
              const backendMessage = err && err.response && err.response.data && err.response.data.message
                ? String(err.response.data.message)
                : '';
              this.$store.commit('dialog/showError', {
                title: this.$t('auth.errors.title'),
                message: backendMessage || this.$t('auth.signIn.errors.google'),
                code: "AUTH_GOOGLE_FAILED",
                number: "1",
                status: true
              })
            }
          },
        },

        computed: {
            ...mapGetters({
              showSignIn: 'auth/isSignIn'
            }),
            isAuthe: {
              get() {
                return this.showSignIn
              },
              set(value) {
                this.$store.commit("auth/isSignIn", !!value)
              }
            }
          },
    }
</script>

<style>
</style>
