var vue=new BaseVue({el:"#vueApp",mixins:[commentMixin],data:{ajax_url:ajax_url,user:user,map_projects:map_projects,updates:[],page:1,lastPage:null,profile:"undefined"==typeof profile?null:profile,all_tree_count:"undefined"==typeof all_tree_count?null:all_tree_count,filter_value:"all_updates",filter_text:"all_updates",updates_count:"",sendingMore:!1,updates_page_type:updates_page_type},ready:function(){},created:function(){"profile"==this.updates_page_type&&(this.emptyDescription(this.profile),this.navbarColor()),refreshMasonry(),this.getUpdates("all_updates")},methods:{getUpdates:function(e,t){var a,s;this.loading=!0,this.filter_text=this.trans("users.filter_"+e),void 0!==t&&(this.filter_text=t.target.innerHTML),"profile"==this.updates_page_type?(a={type:"profile",type_id:null==this.profile?this.user.id:this.profile.id,filter:e},s=ajax_url+"/profile/getAllUpdates?page=1"):s=ajax_url+"/projects/updates/getAllUpdates?page=1",this.$http.post(s,a).then((function(t){var a=t.data;this.updates=a.updates,this.page++,this.lastPage=a.lastPage,this.updates_count=a.updates_count,this.filter_value=e,this.loading=!1,refreshMasonry(),this.after()}))},moreUpdates:function(){var e,t;this.sendingMore||(this.sendingMore=!0,"profile"==this.updates_page_type?(e={type:"profile",type_id:null==this.profile?this.user.id:this.profile.id,filter:this.filter_value},t=ajax_url+"/profile/getAllUpdates?page="+this.page):t=ajax_url+"/projects/updates/getAllUpdates?page="+this.page,this.$http.post(t,e).then((function(e){var t=e.data,a=t.updates[0],s=_.findIndex(this.updates,{date:a.date});s&&-1!=s&&(this.updates[s].updates=this.updates[s].updates.concat(a.updates),t.updates.splice(0,1)),this.updates=this.updates.concat(t.updates),this.page++,refreshMasonry(),this.after()})).finally((function(){this.sendingMore=!1})))}}});