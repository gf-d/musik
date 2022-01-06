var vue = new BaseVue({
    el: '#vueApp',
    mixins: [ commentMixin ],
    data: {
        ajax_url: ajax_url,
        user: user,
        map_projects: map_projects,
        updates: [],
        page: 1,
        lastPage: null,
        profile: (typeof profile == 'undefined')? null : profile,
        all_tree_count: (typeof all_tree_count == 'undefined')? null : all_tree_count,
        filter_value: 'all_updates',
        filter_text: 'all_updates',
        updates_count: '',
        sendingMore: false,
        updates_page_type: updates_page_type,
    },
    ready: function(){
        //
    },
    created: function () {
        if (this.updates_page_type == 'profile') {
            this.emptyDescription(this.profile);
            this.navbarColor();
        }

        refreshMasonry();
        this.getUpdates('all_updates');
    },
    methods: {
        getUpdates: function (filter, event) {
            this.loading = true;
            var data;
            var url;
            this.filter_text = this.trans('users.filter_'+filter);
            if (typeof event !== 'undefined') this.filter_text = event.target.innerHTML;

            if (this.updates_page_type == 'profile') {
                data = {
                    type: 'profile',
                    type_id: (this.profile == null) ? this.user.id : this.profile.id,
                    filter: filter,
                };
                // this route is shared with profile and userProfile, as it takes updates from parameter type_id
                url = ajax_url + '/profile/getAllUpdates?page=1';

            } else {
                url = ajax_url + '/projects/updates/getAllUpdates?page=1';
            }
            this.$http.post(url, data)
                .then(function (response) {
                    var data = response.data;
                    this.updates = data.updates;
                    this.page++;
                    this.lastPage = data.lastPage;
                    this.updates_count = data.updates_count;
                    this.filter_value = filter;
                    // MASONRY GRID
                    this.loading = false;
                    refreshMasonry();
                    this.after();
                });
        },
        moreUpdates: function () {
            if (!this.sendingMore) {
                this.sendingMore = true;

                var data;
                var url;
                if (this.updates_page_type == 'profile') {
                    data = {
                        type: 'profile',
                        type_id: (this.profile == null) ? this.user.id : this.profile.id,
                        filter: this.filter_value,
                    };
                    // this route is shared with profile and userProfile, as it takes updates from parameter follower_id
                    url = ajax_url + '/profile/getAllUpdates?page=' + this.page;
                } else {
                    url = ajax_url + '/projects/updates/getAllUpdates?page=' + this.page;
                }
                this.$http.post(url, data)
                    .then(function (response) {
                        var data = response.data;
                        var first_date = data.updates[0];
                        var last_date = _.findIndex(this.updates, {date: first_date.date});

                        if (last_date && last_date != -1) {
                            this.updates[last_date].updates = this.updates[last_date].updates.concat(first_date.updates);
                            data.updates.splice(0, 1);
                        }

                        this.updates = this.updates.concat(data.updates);
                        this.page++;
                        // MASONRY GRID
                        refreshMasonry();
                        this.after();
                    }).finally(function () {
                        this.sendingMore = false;
                    });
            }
        },
    }
});

