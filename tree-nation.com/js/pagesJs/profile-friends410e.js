var vue = new BaseVue({
    el: '#vueApp',
    data: {
        profile: profile,
        description: '',
        friends: friends,
        hasMore: hasMore,
        page: 1,
        all_tree_count: all_tree_count,
        color: '',
        color_number: '',
        user_progress: '',
        next_color: ''
    },
    created: function () {
        this.emptyDescription(this.profile);
        this.navbarColor();
    },
    methods: {
        moreFriends: function () {
            if (!this.sendingMore) {
                this.sendingMore = true;
                this.page++;
                this.$http.post(ajax_url + '/profile/getProfileFriends?page=' + this.page, {
                    id: this.profile.id
                }).then(function (response) {
                    var data = response.data;
                    this.friends = this.friends.concat(data.friends);
                    this.hasMore = data.hasMore;
                }).finally(function () {
                    this.sendingMore = false;
                });
            }
        },
    }
});