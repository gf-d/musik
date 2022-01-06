var vue = new BaseVue({
    el: '#vueApp',
    mixins: [ commentMixin ],
    data: {
        trees: [],
        profile: profile,
        description: '',
        all_tree_count: all_tree_count,
        color: '',
        color_number: '',
        user_progress: '',
        next_color: '',
        tree_count: '',
        page: 1,
        lastPage: null,
        message: '',
        link: '',
        class_extend: '',
        image: {file: '', name: ''},
        imageUploaded: false,
        filter_value: 'all_trees',
        tree: tree,
        contribution_confirmation: false,
    },

    created: function () {
        this.loading = true;
        this.getTrees(this.filter_value);
        this.emptyDescription(this.profile);
        this.navbarColor();
        if (this.tree != '') {
            this.showModal(this.tree);
        }
    },

    methods: {
        getTrees: function (filter) {
            this.loading = true;
            refreshMasonry();
            this.$http.post(ajax_url + '/profile/getProfileTrees?page=' + 1, {
                id: this.profile.id,
                filter: filter
            }).then(function (response) {
                this.trees = response.data.trees;
                this.page = 2;
                this.lastPage = response.data.lastPage;
                this.tree_count = response.data.tree_count;
                this.filter_value = filter;
                this.loading = false;
                refreshMasonry();
                this.after();
            }).finally(function () {
                $(function () {
                    $('[data-toggle="tooltip"]').tooltip()
                })
            });
        },
        moreTrees: function () {
            if (!this.sendingMore) {
                this.sendingMore = true;
                this.$http.post(ajax_url + '/profile/getProfileTrees?page=' + this.page, {
                    id: this.profile.id,
                    filter: this.filter_value
                }).then(function (response) {
                    var data = response.data;
                    this.trees = this.trees.concat(data.trees);
                    this.page++;
                    // MASONRY GRID
                    refreshMasonry();
                    this.after();
                }).finally(function () {
                    this.sendingMore = false;
                    $(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    })
                });
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
        },
        togglePinnedTree: function (tree) {
            this.$http.post(ajax_url + '/profile/togglePinnedTree', {
                id: this.profile.id,
                tree_id: tree.id,
            }).then(function (response) {
                if (response.data.success) {
                    tree.is_pinned = !tree.is_pinned;
                    if (tree.is_pinned) notificationCenter(this.trans('trees.pinned_tree_alert'), "notice", false);
                    else notificationCenter(this.trans('trees.unpinned_tree_alert'), "notice", false);

                    Vue.nextTick(function () {
                        $('[data-toggle="tooltip"]').tooltip()
                    });
                }
            });
        },
    }
});