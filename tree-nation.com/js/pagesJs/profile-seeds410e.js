var vue = new BaseVue({
    el: '#vueApp',
    mixins: [ commentMixin ],
    data: {
        trees: [],
        profile: profile,
        description: '',
        sponsor_specie: '',
        sponsor: '',
        seed_count: seed_count,
        page: 1,
        lastPage: null,
        details: '',
        editTree: false,
        message: '',
        link: '',
        class_extend: '',
        filter_value: 'all_seeds',
        all_tree_count: all_tree_count,
        color: '',
        color_number: '',
        tree: tree,
        user_progress: '',
        next_color: '',
        drops: '',
        weather: [5,5,5,5,5],
        weatherDescriptions: [],
        drought: '',
        wdrops_conv_obj: wdrops_conv_obj
    },

    created: function () {
        this.loading = true;
        this.getSeeds(this.filter_value);
        this.emptyDescription(this.profile);
        if(this.seed_count == null) this.seed_count = 0;
        this.navbarColor();
        this.userDrops();
        this.getWeather();
        this.getWeatherDescriptions();
    },
    methods: {
        userDrops: function (){
            this.drops = this.user ? this.user.drops : 0;
        },
        getSeeds: function (filter){
            this.loading = true;
            refreshMasonry();
            this.$http.post(ajax_url + '/profile/getProfileSeeds?page=' + 1, {
                id: this.profile.id,
                filter: filter
            }).then(function (response) {
                this.trees = response.data.trees;
                if (response.data.sponsor) {
                    this.sponsor = response.data.sponsor.user;
                    this.sponsor_specie = response.data.sponsor.specie;
                }
                this.filter_value = filter;
                this.page = 2;
                this.lastPage = response.data.lastPage;
                this.seed_count = response.data.seed_count;
                // MASONRY GRID
                this.loading = false;
                refreshMasonry();
                if (this.tree != '') {
                    this.showModal(this.tree);
                    Vue.nextTick(function () {
                        autosize($('#seed-modal .post-comment textarea'));
                    });
                }
                this.after();
            });
        },
        moreSeeds: function () {
            if (!this.sendingMore) {
                this.sendingMore = true;
                this.$http.post(ajax_url + '/profile/getProfileSeeds?page=' + this.page, {
                    id: this.profile.id,
                    filter: this.filet_value
                }).then(function (response) {
                    var data = response.data;
                    this.trees = this.trees.concat(data.trees);
                    this.page++;
                    // MASONRY GRID
                    refreshMasonry();
                    this.after();
                }).finally(function () {
                    this.sendingMore = false;
                });
            }
        },
        getWeather: function() {
            this.$http.post(ajax_url + '/seeds/getWeather').then(function (response) {
                this.weather = response.data.weather;
                this.drought = response.data.drought;
                Vue.nextTick(function () {
                    loadWeatherIcons();
                });
            });
        },
        getWeatherDescriptions: function() {
            this.$http.post(ajax_url + '/seeds/getWeatherDescriptions').then(function (response) {
                this.weatherDescriptions = response.data;
            });
        },
        descrLengthAuthor: function (tree) {
            if (tree.owner.last_name.length > 20) {
                return tree.owner.last_name.slice(0, 17) + '...';
            }
            else {
                return tree.owner.last_name;
            }
        },
        uploadImage: function () {
            $('#upload').trigger('click');
        },
        createImage: function (file) {
            var image = new Image();
            var reader = new FileReader();
            var vm = this;

            reader.onload = function (e) {
                Vue.set(vm.image, 'file', e.target.result);
                vm.image.name = file.name;
                refreshMasonry();
            };
            reader.readAsDataURL(file);
            this.imageUploaded = true;
        }
    }
});