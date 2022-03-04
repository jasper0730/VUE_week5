const apiUrl = 'https://vue3-course-api.hexschool.io/v2';
const apiPath = 'jasper07301';
// VeeValidate全部規則加入
Object.keys(VeeValidateRules).forEach(rule => {
    if (rule !== 'default') {
        VeeValidate.defineRule(rule, VeeValidateRules[rule]);
    }
});
// 載入中文語系的檔案
VeeValidateI18n.loadLocaleFromURL('https://unpkg.com/@vee-validate/i18n@4.1.0/dist/locale/zh_TW.json');

VeeValidate.configure({
    generateMessage: VeeValidateI18n.localize('zh_TW'), // 使用語系
    validateOnInput: true, // 一輸入就驗證
});

const app = Vue.createApp({
    data() {
        return {
            isLoading: false,
            cartData: {
                carts: {},  //若無預設carts,載入網頁時,html的cartData.cart還沒載入,會噴錯因為找不到這個屬性
            },
            products: [],
            productId: '',
            loadingStatus: {
                loadingItem: '',
            },
            form: {
                user: {
                    name: '',
                    email: '',
                    tel: '',
                    address: '',
                },
                message: '',
            },
        }
    },
    methods: {
        getProductList() {
            const url = `${apiUrl}/api/${apiPath}/products/all`
            axios.get(url)
                .then((res) => {
                    this.products = res.data.products;
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        openProductModal(id) {  //前面的按鈕點擊後觸發此函式並帶入id
            this.productId = id;  // 把帶入的id存入data,這裡存的productId是對應內層使用props綁定id用來撈指定資料的
            this.$refs.productModal.openModal();  // 使用refs觸發openModal,所以html的modal有放ref屬性
        },
        getCartList() {
            const url = `${apiUrl}/api/${apiPath}/cart`
            axios.get(url)
                .then((res) => {
                    this.cartData = res.data.data;
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        addToCart(id, qty = 1) {
            this.isLoading = true;
            this.loadingStatus.loadingItem = id;
            const url = `${apiUrl}/api/${apiPath}/cart`
            const data = {
                product_id: id,
                qty,
            };
            this.$refs.productModal.hideModal();
            axios.post(url, { data })
                .then((res) => {
                    this.getCartList();
                    this.loadingStatus.loadingItem = '';
                    alert(res.data.message)
                    this.isLoading = false;
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        deleteCartItem(id) {
            this.isLoading = true;
            const url = `${apiUrl}/api/${apiPath}/cart/${id}`;
            this.loadingStatus.loadingItem = id;
            axios.delete(url)
                .then((res) => {
                    this.getCartList()
                    this.loadingStatus.loadingItem = '';
                    this.isLoading = false;
                    alert('刪除成功');
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        cleanCart() {
            this.isLoading = true;
            const url = `${apiUrl}/api/${apiPath}/carts`;
            axios.delete(url)
                .then((res) => {
                    this.getCartList();
                    alert('清空購物車完成');
                    this.isLoading = false;
                })
                .catch((err) => {
                    alert(err.data.message);
                })
        },
        updateData(item) {
            if (item.qty > 0) {
                this.isLoading = true;
                const url = `${apiUrl}/api/${apiPath}/cart/${item.id}`;
                axios.put(url, {
                    data: {
                        product_id: item.product_id,
                        qty: item.qty,
                    },
                })
                    .then((res) => {
                        this.getCartList();
                        this.isLoading = false;
                    })
                    .catch((err) => {
                        alert(err.data.message);
                    });
            }
        },
        createOrder() {
            this.isLoading = true;
            const url = `${apiUrl}/api/${apiPath}/order`;
            const data = this.form;
            axios.post(url, { data })
                .then((res) => {
                    alert(res.data.message);
                    this.$refs.form.resetForm(); //這邊清空的是dom元素的,resetForm()是veevalidate的方法
                    this.getCartList();
                    this.isLoading = false;
                })
                .catch((err) => {
                    alert(err.data.message);
                });
        },
        isPhone(value) {
            const phoneNumber = /^(09)[0-9]{8}$/
            return phoneNumber.test(value) ? true : '需要正確的電話號碼'
        },
    },
    mounted() {
        this.getProductList();
        this.getCartList();
    },
});
// 全域註冊
app.use(VueLoading.Plugin);
app.component('loading', VueLoading.Component);
app.component('VForm', VeeValidate.Form)
app.component('VField', VeeValidate.Field)
app.component('ErrorMessage', VeeValidate.ErrorMessage)
app.component('product-modal', {
    props: ['id'], // 對應外層的productId,於html做綁定
    template: '#userProductModal',
    data() {
        return {
            myModal: {},
            productData: {},
            qty: 1,
        };
    },
    watch: {
        id() {  //  使用watch觸發,id若有更動即觸發
            this.getProduct();
        },
    },
    methods: {
        openModal() {
            this.qty = 1;
            this.myModal.show();
        },
        hideModal() {
            this.myModal.hide();
        },
        getProduct() {
            const url = `${apiUrl}/api/${apiPath}/product/${this.id}`;  //帶入props的id
            axios.get(url)
                .then((res) => {
                    this.productData = res.data.product;
                })
                .catch((err) => {
                    console.log(err.data.message);
                })
        },
    },
    mounted() {
        this.myModal = new bootstrap.Modal(this.$refs.modal, {
            keyboard: false
        });
    },
})

    .mount('#app')