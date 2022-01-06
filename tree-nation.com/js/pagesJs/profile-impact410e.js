var vue = new BaseVue({
    el: '#vueApp',
    data: {
        profile: profile,
        description: '',
        all_tree_count: all_tree_count,
        color: '',
        color_number: '',
        user_progress: '',
        next_color: '',
        web_data: null,
        web_data_loaded: false,
        graph_data: [],
        chart_alltime: null,
        chart_year: null,
        chart_quarter: null,
        chart_month: null,
        chart_web: {},
        chart_pie: [],
        tracking_code: tracking_code,

        aggregated: {
            'species_categories': {'alltime': 0},
            'most_planted_species': {'alltime': 0},
        },

        current_filter: 'alltime',
        common_options: {},

        map_projects: [],

        ajax_url: ajax_url,
        project: {
            slug: '-',
        },
        details: {CO2_offset_period: '0,0', productivity_period: '0,0', image: ''},
        specie_names_expanded: true,

        split_at: 4,
        periods_loaded : {
            'alltime': false,
            'year': false,
            'quarter': false,
            'month': false
        },
        period_has_data: {
            'alltime': false,
            'year': false,
            'quarter': false,
            'month': false
        },

        periods_by_id: {
            0: 'alltime',
            1: 'year',
            2: 'quarter',
            3: 'month'
        },
        periods_by_name: {
            'alltime': 0,
            'year': 1,
            'quarter': 2,
            'month': 3
        },
    },
    created: function()
    {
        // select all code on doubleclick
        $('#js--tracking-code').click(function() {
            $(this).select();

            var text = this,
                range, selection;

            if (document.body.createTextRange) {
                range = document.body.createTextRange();
                range.moveToElementText(text);
                range.select();
            } else if (window.getSelection) {
                selection = window.getSelection();
                range = document.createRange();
                range.selectNodeContents(text);
                selection.removeAllRanges();
                selection.addRange(range);
            }
        });

        this.resetVars();

        moment.locale(this.currentLocale);

        var that = this;
        $('#select-period').on('change', function (e) {
            that.changeFilter(e.target.value);
        });

        this.emptyDescription(this.profile);
        this.navbarColor();

        this.loadPeriods(true);
        this.loadWebData();

    },
    methods: {
        resetVars: function()
        {
            var keys = ['planted','reforested','co2','species_categories','most_planted_species'];

            for(var k in keys) {
                this.aggregated[keys[k]] = [];
                for (var p=0; p<=3; p++) {
                    this.aggregated[keys[k]][this.periods_by_id[p]] = [];
                }
            }
        },
        translateThisLabel: function (label) {
            month = label.match(/January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|Jun|Jul|Aug|Sep|Oct|Nov|Dec/g);

            if ( !month )
                return label;

            translation = this.translateMonth( month[0] );
            return label.replace( month, translation, 'g' );
        },
        translateMonth: function ( month ) {
            var result = month;

            switch(month) {
                case 'January': result = 'month_1'; break;
                case 'February': result = 'month_2'; break;
                case 'March': result = 'month_3'; break;
                case 'April': result = 'month_4'; break;
                case 'May': result = 'month_5'; break;
                case 'June': result = 'month_6'; break;
                case 'July': result = 'month_7'; break;
                case 'August': result = 'month_8'; break;
                case 'September': result = 'month_9'; break;
                case 'October': result = 'month_10'; break;
                case 'November': result = 'month_11'; break;
                case 'December': result = 'month_12'; break;
                case 'Jan': result = 'month_1_abbr'; break;
                case 'Feb': result = 'month_2_abbr'; break;
                case 'Mar': result = 'month_3_abbr'; break;
                case 'Apr': result = 'month_4_abbr'; break;
                // NOTE: May (full noun) in English matches its abbreviation, so the switch will never reach this case. And that's ok: we'll show always May not abbreviated.
                case 'May': result = 'month_5_abbr'; break;
                case 'Jun': result = 'month_6_abbr'; break;
                case 'Jul': result = 'month_7_abbr'; break;
                case 'Aug': result = 'month_8_abbr'; break;
                case 'Sep': result = 'month_9_abbr'; break;
                case 'Oct': result = 'month_10_abbr'; break;
                case 'Nov': result = 'month_11_abbr'; break;
                case 'Dec': result = 'month_12_abbr'; break;
            }

            return this.trans('messages.'+result);
        },
        initAlltime: function()
        {
            this.initCommonOptions();

            for (var i=0; i<4; i++) {
                this.chart_pie[i] = null;
            }
            this.graph_pie(0);
        },
        specieDetails: function (specie) {
            this.project = specie.project;
            this.details = specie;
            if (this.details.common_names && this.details.common_names.length > 45) this.specie_names_expanded = false;
        },
        initCommonOptions: function() {
            var vueApp = this;

            this.common_options = {
                maintainAspectRatio: false,
                responsive: false,
                scales: {
                    yAxes: [
                        // {
                        //     id: 'progressive-compensation-y-axis',
                        //     ticks: {
                        //         display: false,
                        //         beginAtZero:true,
                        //         min: 0,
                        //         max: 16,
                        //         stepSize: 1
                        //     },
                        //     gridLines: {
                        //         display: false,
                        //         drawBorder: false,
                        //         color: '#49BC6B',
                        //     }
                        // },
                        {
                            id: 'trees-y-axis',
                            position: 'right',
                            ticks: {
                                display: true,
                                beginAtZero:true,
                                min: 0,
                            },
                            gridLines: {
                                display: true,
                                drawOnChartArea: false,
                                drawBorder: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: vueApp.trans('users.graph_number_of_trees')
                            }
                        },
                        {
                            id: 'compensation-y-axis',
                            ticks: {
                                display: true,
                                beginAtZero:true,
                                min: 0,
                            },
                            gridLines: {
                                display: true,
                                drawBorder: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: vueApp.trans('users.graph_tons_co2')
                            }
                        }
                    ],
                    xAxes: [{
                        type: "time",
                        ticks : {
                            display: true,
                            source: 'labels',
                            callback: function( label, index, labels ) {
                                var process = index == 0 || (index > 0 && labels[index-1] != labels[index]);
                                return process ? vueApp.translateThisLabel( label ) : '';
                            }
                        },
                        time: {
                            unit: 'day',
                            displayFormats: {
                                day: 'MMM YYYY',
                                // day: 'MMM',
                            }
                        },
                        gridLines: {
                            display: true,
                            drawOnChartArea: false,
                            drawBorder: true,
                        }
                    }],
                },
                legend: {
                    position: 'bottom',
                    reverse: false
                },
                tooltips: {
                    mode: 'index',
                    callbacks: {
                        title: function(tooltipItem, data) {
                            return moment(tooltipItem[0].xLabel).format('DD MMM YYYY');
                        },
                        label: function(tooltipItem, chart) {
                            if (tooltipItem.datasetIndex == 0) {
                                return vueApp.trans('users.graph_tons_co2_tooltip', {'number': Math.round(tooltipItem.yLabel * 100) / 100});
                            } else {
                                return vueApp.trans('users.graph_trees_planted_tooltip', {'number': tooltipItem.yLabel});
                            }
                        }
                    },
                    // annotation: {
                    //     annotations: annotations
                    // }
                }
            };
            // common_options end
        },
        total_planted: function() {
            var t = 0;
            for (var k in this.aggregated['planted'][this.current_filter]) {
                t += 1 * this.aggregated['planted'][this.current_filter][k].trees;
            }
            return t;
        },
        total_reforested: function() {
            var t = 0;
            for (var k in this.aggregated['reforested'][this.current_filter]) {
                t += 1 * this.aggregated['reforested'][this.current_filter][k].reforested;
            }
            return Math.round(100*t)/100;
        },
        total_co2: function() {
            var t = 0;
            for (var k in this.aggregated['co2'][this.current_filter]) {
                t += 1 * this.aggregated['co2'][this.current_filter][k].compensated_co2;
            }
            return Math.round(100*t)/100;
        },
        total_families_helped: function() {
            if (typeof this.aggregated['planted'] == 'undefined') return 0;

            var t = 0;
            for (var k in this.aggregated['planted'][this.current_filter]) {
                t += 1 * this.aggregated['planted'][this.current_filter][k].families_helped;
            }
            return t;
        },
        total_planters_helped: function() {
            if (typeof this.aggregated['planted'] == 'undefined') return 0;

            var t = 0;
            for (var k in this.aggregated['planted'][this.current_filter]) {
                t += 1 * this.aggregated['planted'][this.current_filter][k].planters_helped;
            }
            return t;
        },
        changeFilter: function(filter_name) {
            this.current_filter = filter_name;
            this.to_tab(filter_name);

            if (!this.periods_loaded[filter_name]) {
                // graphs will be loaded once we have data
                return true;
            }

            switch (filter_name) {
                case 'alltime': this.graph_alltime(); break;
                case 'year': this.graph_year(); break;
                case 'quarter': this.graph_quarter(); break;
                case 'month': this.graph_month(); break;
            }

            var current_filter_id = this.periods_by_name[filter_name];

            this.graph_pie(current_filter_id);
            InitMaps.impactMap(current_filter_id);
        },
        to_tab: function(show_tab) {
            if (this.period_has_data[show_tab] || this.periods_loaded[show_tab]) {
                $('#data-container').show();
            } else {
                $('#data-container').hide();
            }

            $('.forest-impact__trees-graph canvas').addClass('d-none');
            $('#graph-'+show_tab).removeClass('d-none');

            $('.forest-impact__pie canvas').addClass('d-none');
            $('#graph-pie-'+show_tab).removeClass('d-none');
        },
        createGraph: function (dom_element, data, options) {
            var ctx = document.getElementById(dom_element).getContext('2d');

            var new_chart = new Chart(ctx, {
                type: 'line',
                data: data,
                options: options,
            });

            var maxTrees = new_chart.scales['trees-y-axis'].max;
            maxTrees = maxTrees * 1.5;
            if (maxTrees < 10) {
                maxTrees = 10;
            }
            new_chart.options.scales.yAxes[0].ticks.max = maxTrees;

            var maxCO2 = new_chart.scales['compensation-y-axis'].max;
            if (maxCO2 < 10) {
                maxCO2 = 10;
            }
            new_chart.options.scales.yAxes[1].ticks.max = maxCO2;
            new_chart.update();

            return new_chart;
        },
        build_data: function(period) {
            var vueApp = this;
            return {
                labels: vueApp.graph_data[period].labels,
                datasets: [{
                    label: vueApp.trans('users.graph_compensation'),
                    yAxisID: 'compensation-y-axis',
                    data: vueApp.graph_data[period].compensation,
                    backgroundColor: 'transparent',
                    borderColor: '#50BCE7',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointBorderWidth: 1,
                    pointBackgroundColor: '#BCE1F2',
                    steppedLine: true
                },{
                    label: vueApp.trans('users.graph_trees_planted'),
                    yAxisID: 'trees-y-axis',
                    data: vueApp.graph_data[period].trees,
                    backgroundColor: '#CEE8D3',
                    borderColor: '#49BC6B',
                    borderWidth: 1,
                    pointStyle: 'circle',
                    pointBorderWidth: 1,
                    pointBackgroundColor: '#CEE8D3',
                    steppedLine: true
                }]
            }
        },
        build_pie_data: function(period) {
            var vueApp = this;

            var style = getComputedStyle(document.body);

            var periods = ['alltime','year','quarter','month'];
            var species = this.aggregated['species_categories'][periods[period]];
            var labels = [];
            var data = [];
            var colors = [];

            var color;
            for(var k of Object.keys(species)) {
                labels.push(species[k].name);
                data.push(species[k].pct);
                color = style.getPropertyValue('--'+species[k].code);
                colors.push(color.trim());
            }

            return {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: colors,
                    borderWidth: 0,
                }]
            }
        },
        build_annotations: function(period) {
            var vueApp = this;
            var text_period = '';
            switch (period) {
                case 0: text_period = 'alltime'; break;
                case 1: text_period = 'year'; break;
                case 2: text_period = 'quarter'; break;
                case 3: text_period = 'month'; break;
            }
            var annotations = [];
            //TODO ramon check that .type is not a reserved keyword!
            if (vueApp.profile.type == 'citizen') {
                annotations = [{
                    drawTime: "afterDatasetsDraw",
                    id: "hline",
                    type: "line",
                    mode: "horizontal",
                    scaleID: "compensation-y-axis",
                    value: 9,
                    borderColor: "#50BCE7",
                    borderWidth: 2,
                    label: {
                        content: vueApp.trans('users.graph_goal_for_the_'+text_period),
                        enabled: true,
                        position: 'left',
                        backgroundColor: 'transparent',
                        fontColor: '#50BCE7',
                        yAdjust: -10
                    }
                }];
            }
            return annotations;
        },
        graph_month: function() {
            var vueApp = this;
            var period = 3;

            if (vueApp.chart_month == null) {

                var data = vueApp.build_data(period);
                var annotations = vueApp.build_annotations(period);
                var options_month = this.common_options;
                options_month.scales.xAxes[0].time = {
                    unit: 'day',
                    displayFormats: {
                        day: 'D',
                    }
                };
                options_month.tooltips.annotation = {
                    annotations: annotations
                };

                vueApp.chart_month = this.createGraph("graph-month", data, options_month);
            }
        },
        graph_quarter: function() {
            var vueApp = this;
            var period = 2;

            if (vueApp.chart_quarter == null) {

                var data = vueApp.build_data(period);
                var annotations = vueApp.build_annotations(period);
                var options_quarter = this.common_options;
                options_quarter.scales.xAxes[0].time = {
                    unit: 'month',
                    displayFormats: {
                        month: 'MMMM Y',
                    }
                };
                options_quarter.tooltips.annotation = {
                    annotations: annotations
                };

                vueApp.chart_quarter = this.createGraph("graph-quarter", data, options_quarter);
            }
        },
        graph_alltime: function() {
            var vueApp = this;
            var period = 0;

            if (vueApp.chart_alltime == null) {
                var data = vueApp.build_data(period);
                var options_alltime = this.common_options;
                options_alltime.scales.xAxes[0].time = {
                    unit: 'day',
                    displayFormats: {
                        day: 'MMM YYYY',
                    },
                };
                vueApp.chart_alltime = this.createGraph("graph-alltime", data, options_alltime);
            }
        },
        graph_year: function() {
            var vueApp = this;
            var period = 1;

            if (vueApp.chart_year == null) {

                var data = vueApp.build_data(period);

                var annotations = [];
                if (vueApp.profile.user_type == 'citizen') {
                    annotations = [{
                            drawTime: "afterDatasetsDraw",
                            id: "hline",
                            type: "line",
                            mode: "horizontal",
                            scaleID: "compensation-y-axis",
                            value: 9,
                            borderColor: "#50BCE7",
                            borderWidth: 2,
                            label: {
                                content: vueApp.trans('users.graph_goal_for_the_year'),
                                enabled: true,
                                position: 'left',
                                backgroundColor: 'transparent',
                                fontColor: '#50BCE7',
                                yAdjust: -10
                            }
                    }];
                }

                var options_year = this.common_options;
                options_year.scales.xAxes[0].time = {
                    unit: 'month',
                    displayFormats: {
                        month: 'MMMM',
                    }
                };
                options_year.tooltips.annotation = {
                    annotations: annotations
                };

                vueApp.chart_year = this.createGraph("graph-year", data, options_year);
            }
        },
        graph_pie: function(period) {
            var vueApp = this;

            if (vueApp.chart_pie[period] == null) {
                var periods = ['alltime','year','quarter','month'];
                var data = vueApp.build_pie_data(period);
                var options_pie = {
                    legend: {
                        display: false,
                    },
                    cutoutPercentage: 60,
                    layout: {
                        padding: {
                            left: 10,
                            right: 10,
                            top: 10,
                            bottom: 10
                        }
                    }
                };

                // create the graph
                var ctx = document.getElementById("graph-pie-"+periods[period]).getContext('2d');

                var new_chart = new Chart(ctx, {
                    type: 'doughnut', // pie
                    data: data,
                    options: options_pie,
                });
                new_chart.update();
                vueApp.chart_pie[period] = new_chart;
            }
        },
        graph_web: function() {
            var vueApp = this;
            var data = {
                labels: vueApp.web_data.labels_web,
                datasets: [{
                    label: vueApp.trans('users.graph_compensation'),
                    yAxisID: 'compensation-y-axis',
                    data: vueApp.web_data.compensation_web,
                    backgroundColor: 'transparent',
                    borderColor: '#50BCE7',
                    borderWidth: 2,
                    pointStyle: 'circle',
                    pointBorderWidth: 1,
                    pointBackgroundColor: '#BCE1F2',
                    steppedLine: true
                }]
            };

            var ctx = document.getElementById("js--graph-co2-web").getContext('2d');

            vueApp.chart_web = new Chart(ctx, {
                type: 'line',
                data: data,
                options: {
                    scales: {
                        yAxes: [{
                            id: 'compensation-y-axis',
                            ticks: {
                                display: true,
                                beginAtZero:true,
                                min: 0,
                            },
                            gridLines: {
                                display: true,
                                drawBorder: true,
                            },
                            scaleLabel: {
                                display: true,
                                labelString: vueApp.trans('users.graph_grams_co2')
                            }
                        }],
                        xAxes: [{
                            type: "time",
                            ticks: {
                                display: true,
                                source: 'labels',
                                callback: function( label, index, labels ) {
                                    var process = index == 0 || (index > 0 && labels[index-1] != labels[index]);
                                    return process ? vueApp.translateThisLabel( label ) : '';
                                }
                            },
                            time: {
                                unit: 'day',
                                displayFormats: {
                                    day: 'MMM YYYY'
                                }
                            },
                            gridLines: {
                                display: true,
                                drawOnChartArea: false,
                                drawBorder: true,
                            }
                        }],
                    },
                    legend: {
                        position: 'bottom',
                        reverse: false
                    },
                    tooltips: {
                        mode: 'index',
                        callbacks: {
                            title: function(tooltipItem, data) {
                                return moment(tooltipItem[0].xLabel).format('DD MMM YYYY');
                            },
                            label: function(tooltipItem, chart) {
                                if (tooltipItem.datasetIndex == 0) {
                                    return vueApp.trans('users.graph_grams_co2_tooltip', {'number': Math.round(tooltipItem.yLabel * 100) / 100});
                                }
                            }
                        }
                    }
                }
            });

            var maxCO2 = vueApp.chart_web.scales['compensation-y-axis'].max;
            if (maxCO2 < 10) {
                maxCO2 = 10;
            }
            vueApp.chart_web.options.scales.yAxes[0].ticks.max = maxCO2;

            vueApp.chart_web.update();
        },

        activateTracking: function() {
            this.$http.post(ajax_url + '/userProfile/activateTracking', {
                user_id: user.id
            }).then(function (response) {
                this.loggedUser(response.data);
                if (response.data == 'loggedOut' || response.data == 'wrongUser')
                    return;
                this.tracking_code = response.data;
                $('#co2-website-code-modal').modal('show');
            });
        },

        loadPeriods: function(is_alltime) {
            var period_start = 1; // alltime already loaded
            var period_end = 3;
            var route = '/profile/impactPeriods';
            var periods_to_calc = [1,2,3];
            if (is_alltime) {
                period_start = 0;
                period_end = 0;
                route = '/profile/impactPeriods';
                periods_to_calc = [0];
            }

            for (var i=period_start; i<=period_end; i++) {
                this.period_has_data[this.periods_by_id[i]] = false;
            }

            this.$http.post(ajax_url + route, {
                profile_id: profile.id,
                periods_to_calc: periods_to_calc
            }).then(function (response) {
                var aggr = Object.assign({}, response.data.aggregated);

                if (is_alltime) {
                    this.aggregated = Object.assign({}, response.data.aggregated);
                    this.graph_data = response.data.graph_data;
                    this.map_projects = response.data.map_projects;
                } else {
                    // merge values
                    for(var key in aggr) {
                        if (aggr.hasOwnProperty(key)) this.aggregated[key] = Object.assign({}, this.aggregated[key], aggr[key]);
                    }
                    this.graph_data = Object.assign({}, this.graph_data, response.data.graph_data);
                    this.map_projects = Object.assign({}, this.map_projects, response.data.map_projects);
                }
                map_projects = this.map_projects;

                // flags for loaded and existing data
                for (var i=period_start; i<=period_end; i++) {
                    var filter_name = this.periods_by_id[i];
                    this.period_has_data[filter_name] = 0 < (this.aggregated['planted'][filter_name].length + this.aggregated['reforested'][filter_name].length + this.aggregated['co2'][filter_name].length);
                    this.periods_loaded[this.periods_by_id[i]] = true;
                }

                if (is_alltime) {
                    this.initAlltime();
                    this.changeFilter(this.current_filter); // will force creating the graphs with the loaded data.

                    // for better performance: only AFTER alltime is loaded we'll load the other periods
                    this.loadPeriods(false);
                } else {
                    this.changeFilter(this.current_filter); // will force creating the graphs with the loaded data.
                }

            });
        },

        loadWebData: function() {
            var that = this;
            // $http post or get won't handle properly the jsonp cross domain requests. Use ajax or getJSON
            $.getJSON(ajax_url_new + '/profile/impact-web/'+this.profile.id).then(function (response) {
                that.web_data = response.data.web_data;
                that.has_web_data = response.data.has_web_data;
                that.web_data_loaded = true;

                if (that.web_data.compensation_web.length) {
                    that.graph_web();
                }

                if (that.has_web_data) {
                    $('#js--graph-co2-web').removeClass('d-none');
                    $('.forest-impact__co2-web').show();
                }
            });

        }

    }
});