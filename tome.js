var app = angular.module("LeagueClientApp", ['ngRoute', 'ngSanitize', 'breeze.angular', 'tableSort', 'LZW', 'angular-md5']);
app.run(['$rootScope', '$window', '$document', '$location', 'localStorage', 'entityManager', 'settings', function($rootScope, $window, $document, $location, ls, em, settings) {
    $rootScope.settings = settings;
    $rootScope.hide_error = function() {
        $window.utils.hide_modal('#error');
    };
    $rootScope.prev_url = ls.get(ls.pfx + "prev_loc");
    $rootScope.$on('$routeChangeSuccess', function(e, current, prev) {
        try {
            var tnmt = em.get_current_tournament();
            var page_title = tnmt.name ? tnmt.name : 'FFG League';
            var route_title = '';
            route_title = current.$$route.title;
        } catch (e) {
            var page_title = settings.default_title;
        }
        $rootScope.page_title = (route_title ? route_title + ' - ' : '') + page_title;
    });
    $document.on('keyup', function(e) {
        switch (e.keyCode) {
            case 13:
                $('[data-accept]:visible').click();
                break;
            case 27:
                $('[data-cancel]:visible').click();
                break;
        }
    });
}]);
app.run(['breeze', function(breeze) {}]);
app.config(['$routeProvider', '$windowProvider', function($routeProvider, $windowProvider) {
    var settings = {
        'static_prefix': ''
    };
    try {
        settings = $windowProvider.$get().settings;
    } catch (e) {}
    $routeProvider.when("/new-1", {
        title: "Create Tournament",
        controller: "NewCtl",
        templateUrl: settings.static_prefix + "partials/new_1.html"
    }).when("/new-2", {
        title: "Edit Rules",
        controller: "NewCtl",
        templateUrl: settings.static_prefix + "partials/new_2.html"
    }).when("/participants", {
        title: "Edit Participants",
        controller: "ParticipantCtl",
        templateUrl: settings.static_prefix + "partials/participants.html"
    }).when("/dashboard", {
        title: "Dashboard",
        controller: "DashboardCtl",
        templateUrl: settings.static_prefix + "partials/dashboard.html"
    }).when("/leaderboard", {
        title: "Leaderboard",
        controller: "LeaderboardCtl",
        templateUrl: settings.static_prefix + "partials/leaderboard.html"
    }).when("/round/:round_num/", {
        title: "View Round",
        controller: "RoundViewCtl",
        templateUrl: settings.static_prefix + "partials/round_view.html"
    }).when("/edit-pairings", {
        title: "Edit Round",
        controller: "RoundEditCtl",
        templateUrl: settings.static_prefix + "partials/round_edit.html"
    }).when("/print-match-slips/:round_num/", {
        title: "Print Match Slips",
        controller: "MatchSlipCtl",
        templateUrl: settings.static_prefix + "partials/print_match_slips.html"
    }).when("/participant/:ppnt_id/", {
        title: "Player Record",
        controller: "ParticipantScoreCtl",
        templateUrl: settings.static_prefix + "partials/ppnt.html"
    }).when("/timer/", {
        title: "Timer",
        controller: "TimerCtl",
        templateUrl: settings.static_prefix + "partials/timer_standalone.html"
    }).when("/help/", {
        title: "Help",
        templateUrl: settings.static_prefix + "partials/help.html"
    }).when("/print-pairings/:round_num/", {
        title: "Print Pairings",
        controller: "PrintPairingsCtl",
        templateUrl: settings.static_prefix + "partials/print_pairings.html"
    }).when("/print-pods/", {
        title: "Print Pods",
        controller: "PrintPodsCtl",
        templateUrl: settings.static_prefix + "partials/print_pods.html"
    }).when("/print-meeting/", {
        title: "Print Pre-Tournament Meeting",
        controller: "PrintMeetingCtl",
        templateUrl: settings.static_prefix + "partials/print_meeting.html"
    }).otherwise({
        title: "Home",
        controller: 'HomeCtl',
        templateUrl: settings.static_prefix + 'partials/home.html'
    })
}]);
app.constant('localStoragePrefix', 'ffg_league_');
app.constant('stateMetaKey', 'state_metadata');
app.directive('integer', function() {
    return {
        require: "ngModel",
        link: function(scope, elm, attrs, ctl) {
            ctl.$validators.integer = function(modelVal, viewVal) {
                if (ctl.$isEmpty(modelVal)) {
                    return true;
                }
                return utils.is_integer(viewVal);
            };
        }
    }
});
app.directive('positive', function() {
    return {
        require: "ngModel",
        link: function(scope, elm, attrs, ctl) {
            ctl.$validators.positive = function(modelVal, viewVal) {
                if (ctl.$isEmpty(modelVal)) {
                    return true;
                }
                return parseInt(viewVal) >= 0;
            };
        }
    }
});
app.directive('nonzero', function() {
    return {
        require: "ngModel",
        link: function(scope, elm, attrs, ctl) {
            ctl.$validators.nonzero = function(modelVal, viewVal) {
                if (ctl.$isEmpty(modelVal)) {
                    return false;
                }
                return parseInt(viewVal) != 0;
            };
        }
    };
});
app.directive('zeroIndex', function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elm, attrs, ngModel) {
            if (ngModel) {
                ngModel.$parsers.push(function(val) {
                    if (val == "") {
                        return -1;
                    } else {
                        return val - 1;
                    }
                });
                ngModel.$formatters.push(function(val) {
                    if (val == -1) {
                        return "";
                    } else {
                        return val + 1;
                    }
                });
            }
        }
    };
});
app.directive('tableValid', ['entityManager', function(em) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elm, attrs, ctl) {
            ctl.$validators.tableValid = function(modelVal, viewVal) {
                return em.get_current_tournament().table_open(modelVal);
            };
        }
    }
}]);
app.directive('podValid', function() {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elm, attrs, ctl) {
            ctl.$validators.podValid = function(modelVal, viewVal) {
                if (ctl.$isEmpty(viewVal) && scope.$parent.ctl.manually_pod) {
                    return false;
                } else if (!utils.is_integer(viewVal) && scope.$parent.ctl.manually_pod) {
                    return false;
                } else if (modelVal == -1 && scope.$parent.ctl.manually_pod) {
                    return false
                }
                return true;
            };
        }
    }
});
app.directive('scoreCheckbox', ['$window', 'underscore', 'entityManager', function($window, _, em) {
    return {
        restrict: "A",
        require: "ngModel",
        link: function(scope, elm, attrs, ngModel) {
            var tnmt = em.get_current_tournament();
            var parent = elm.parents('tr');
            elm.on('click', function(e) {
                em.manager.acceptChanges();
                em.save();
                tnmt.clear_caches();
            });
            if (ngModel) {
                ngModel.$parsers.push(function(val) {
                    var settings = scope.ctl.tnmt.settings;
                    var checkboxes = parent.find('input:checkbox');
                    var ckd = true,
                        unckd = true;
                    _.each(checkboxes, function(input) {
                        var bool = $window.$(input).is(':checked');
                        ckd &= bool;
                        unckd &= !bool;
                    });
                    _.each(checkboxes, function(cbx, idx) {
                        $window.$(cbx).click().click();
                    });
                    return val ? (ckd ? settings.draw_points : settings.win_points) : (unckd ? undefined : 0);
                });
                ngModel.$formatters.push(function(val) {
                    return val ? true : false;
                });
            }
        }
    };
}]);
app.directive('playerScore', function() {
    return {
        restrict: 'A',
        templateUrl: settings.static_prefix + "partials/pairing_participant.html"
    }
});
app.directive('lgToggle', function() {
    return {
        restrict: 'A',
        scope: {
            selector: "=lgToggle"
        },
        link: function(scope, elm, attrs, ctl) {
            var toggle = function(event) {
                elm.parent().find(scope.selector).toggle();
                elm.toggleClass('open').toggleClass('closed');
            };
            elm.on('click', toggle);
        }
    };
});
app.directive('dynTemplate', ['$http', '$templateCache', '$compile', '$parse', 'underscore', 'settings', function($http, $tmplCache, $compile, $parse, _, settings) {
    var directiveDefinitionObject = {
        link: function(scope, elm, attrs) {
            attrs.$observe('dynTemplate', function(value) {
                var tmpl_name = settings.static_prefix + "partials/" + value;
                $http.get(tmpl_name, {
                    cache: $tmplCache
                }).success(function(content) {
                    elm.html($compile(content)(scope));
                });
            });
        },
        restrict: 'A',
        transclude: true
    };
    return directiveDefinitionObject;
}]);
app.directive('version', ['$http', function($http) {
    var directiveDefinitionObject = {
        link: function(scope, elm, attrs) {
            $http.get('version.txt').success(function(data) {
                elm.text(data);
            });
        },
        restrict: 'A'
    };
    return directiveDefinitionObject;
}]);
app.filter('ordinal', function() {
    return function(input) {
        input = input.toString();
        if (_.size(input) > 1 && input[_.size(input) - 2] == '1') {
            return input + 'th';
        }
        switch (_.last(input)) {
            case '1':
                return input + 'st';
            case '2':
                return input + 'nd';
            case '3':
                return input + 'rd';
            default:
                return input + 'th';
        }
    };
});
app.filter('sign', function() {
    return function(input) {
        return parseInt(input) < 0 ? '-' : '';
    };
});
app.filter('minutes', ['$window', function($window) {
    return function(input) {
        input = parseInt(parseFloat(input) / 60);
        input = $window.Math.abs(input).toString();
        if (input.length < 2) {
            input = '0' + input;
        }
        return input;
    };
}]);
app.filter('seconds', ['$window', function($window) {
    return function(input) {
        input = parseInt(parseFloat(input) % 60);
        input = $window.Math.abs(input).toString();
        if (input.length < 2) {
            input = '0' + input;
        }
        return input;
    };
}]);
app.filter('blankzero', [function() {
    return function(input) {
        if (parseInt(input) == 0) {
            return '   ';
        }
        return input;
    };
}]);
app.filter('truncatedecimal', ['$window', function($window) {
    return function(input, length) {
        return parseFloat(input).toFixed(length);
    };
}]);
app.filter('reverse', [function() {
    return function(input) {
        return input.slice().reverse();
    };
}]);
app.factory('settings', ['$window', function($window) {
    return $window.settings;
}]);
app.factory('debug', ['settings', function(settings) {
    return settings.DEBUG;
}]);
app.factory('navigate', ['$rootScope', '$location', 'underscore', 'localStorage', function navigateFactory($rootScope, $location, _, ls) {
    return {
        path: $location.path(),
        go: function(dest, prev) {
            if (_.isUndefined(prev) || _.isNull(prev)) {
                $rootScope.prev_url = $location.path();
            } else {
                $rootScope.prev_url = prev;
            }
            ls.set(ls.pfx + "prev_loc", $rootScope.prev_url);
            $location.path(dest);
        }
    };
}]);
app.factory('localStorage', ['$window', 'localStoragePrefix', function localStorageFactory($window, pfx) {
    return {
        "pfx": pfx,
        "set": function(key, val) {
            try {
                $window.localStorage.setItem(key, angular.toJson(val));
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.log("Failed to save '" + key + "': quota exceeded.");
                }
                return false;
            }
        },
        "get": function(key, coerce) {
            if (coerce == undefined) {
                coerce = function(val) {
                    return val;
                };
            }
            return coerce(angular.fromJson($window.localStorage.getItem(key)));
        },
        "delete": function(key) {
            $window.localStorage.removeItem(key);
        },
        "clear": function(key) {
            $window.localStorage.clear();
        }
    };
}]);
app.factory('sessionStorage', ['$window', function sessionStorageFactory($window, pfx) {
    return {
        "pfx": pfx,
        "set": function(key, val) {
            try {
                $window.sessionStorage.setItem(key, angular.toJson(val));
                return true;
            } catch (e) {
                if (e.name === 'QuotaExceededError' || e.name === 'NS_ERROR_DOM_QUOTA_REACHED') {
                    console.log("Failed to save '" + key + "': quota exceeded.");
                }
                return false;
            }
        },
        "get": function(key, coerce) {
            if (coerce == undefined) {
                coerce = function(val) {
                    return val;
                };
            }
            return coerce(angular.fromJson($window.sessionStorage.getItem(key)));
        },
        "delete": function(key) {
            $window.sessionStorage.removeItem(key);
        },
        "clear": function(key) {
            $window.sessionStorage.clear();
        }
    };
}]);
app.factory('entityMetadata', ['$window', function entityMetadataFactory($window) {
    return $window.metadata;
}]);
app.factory('underscore', ['$window', function underscoreFactory($window) {
    return $window._;
}]);
app.factory('entityManager', ['breeze', 'entityMetadata', 'localStorage', 'localStoragePrefix', 'stateMetaKey', 'lzw', 'md5', '$window', function entityManagerFactory(breeze, metadata, localStorage, pfx, meta_key, angularlzw, md5, $window) {
    var keyGen = function() {
        this.generateTempKeyValue = function(entityType) {
            var key = localStorage.get(pfx + 'lastpk');
            if (_.isNull(key)) {
                key = 0;
            }
            key -= 1;
            localStorage.set(pfx + 'lastpk', key);
            return key;
        };
    };
    var manager = new breeze.EntityManager({
        serviceName: "",
        metadataStore: metadata,
        keyGeneratorCtor: keyGen
    });
    var save = function() {
        var entity_export = manager.exportEntities(null, false);
        localStorage.set(pfx + 'hash', md5.createHash(entity_export));
        localStorage.set(pfx + 'store', entity_export);
    };
    var load = function() {
        var data = localStorage.get(pfx + 'store');
        if (!_.isNull(data)) {
            manager.importEntities(data);
        }
    };
    var set_current_tournament = function(tnmt) {
        var key = pfx + "tnmt_key";
        localStorage.set(key, tnmt.pk);
    };
    var get_current_tournament = function() {
        var key = localStorage.get(pfx + "tnmt_key");
        var tnmt = manager.getEntityByKey('Tournament', key);
        if ($window.utils.is_null_or_undefined(tnmt)) {
            var tnmts = _.sortBy(manager.getEntities('Tournament'), 'pk');
            tnmt = tnmts[0];
            if (tnmt) {
                localStorage.set(pfx + "tnmt_key", tnmt.pk);
            }
        }
        return tnmt;
    };
    var _get_state_idx_from_memo = function(memo) {
        return _.findIndex(localStorage.get('state_metadata'), function(data, idx) {
            return (data.memo == memo) && (data.tnmt_pk == get_current_tournament().pk);
        });
    };
    var clear_states = function() {
        localStorage.set(meta_key, []);
    };
    var save_state = function(memo) {
        var state_metadata = localStorage.get('state_metadata');
        var next_state_idx = localStorage.get('state_idx');
        next_state_idx = next_state_idx ? next_state_idx : 0;
        var key = "league_state_" + next_state_idx;
        if (_.isUndefined(state_metadata) || _.isNull(state_metadata)) {
            state_metadata = [];
        }
        if (_.isEmpty(_.where(state_metadata, {
                memo: memo,
                tmnt_pk: get_current_tournament().pk
            }))) {
            state_metadata.push({
                memo: memo,
                key: key,
                tnmt_pk: get_current_tournament().pk
            });
        }
        if (_.size(state_metadata) > 10) {
            state_metadata.shift();
        }
        var storage = angularlzw.compress(manager.exportEntities(null, false));
        localStorage.set("state_idx", (next_state_idx + 1) % 10);
        localStorage.set(key, storage);
        localStorage.set(meta_key, state_metadata);
    };
    var load_state = function(memo) {
        var idx = _get_state_idx_from_memo(memo);
        var state_metadata = localStorage.get(meta_key);
        var key = state_metadata[idx].key;
        manager.clear();
        var stateData = angularlzw.decompress(localStorage.get(key));
        manager.importEntities(stateData);
        save();
        window.location.reload();
    };
    var delete_state = function(memo) {
        var idx = _get_state_idx_from_memo(memo);
        var state_metadata = localStorage.get(meta_key);
        var key = state_metadata[idx].key;
        state_metadata.splice(idx, 1);
        localStorage.delete(key);
        localStorage.set(meta_key, state_metadata);
    };
    load();
    $window.em = manager;
    return {
        manager: manager,
        breeze: breeze,
        save: save,
        load: load,
        set_current_tournament: set_current_tournament,
        get_current_tournament: get_current_tournament,
        save_state: save_state,
        load_state: load_state,
        delete_state: delete_state,
        clear_states: clear_states
    };
}]);
app.factory('import-export', ["$window", "breeze", "entityManager", "localStorage", "localStoragePrefix", function($window, breeze, em, localStorage, pfx) {
    var ImportExport = function() {
        var self = this;
        self.show_import_dialog = function() {
            self.mode = 'import';
            $window.utils.show_modal('#import-overlay');
        };
        self.show_export_dialog = function(tnmt) {
            self.mode = 'export';
            var entity_cache = em.manager.exportEntities(null, false);
            var last_pk = localStorage.get('ffg_league_lastpk');
            var export_string = entity_cache + "^^THIS IS A SEPARATOR^^" + last_pk;
            angular.element('#export-data').val(export_string);
            $window.utils.show_modal('#export-overlay');
        };
        self.finish = function(ctl) {
            self.mode = null;
            angular.element('#import-data, #export-data').val('');
            $window.utils.hide_modal('#import-overlay, #export-overlay');
        };
        self.do_import = function(ctl) {
            var data = angular.element('#import-data').val();
            if ($window.confirm('Are you sure?')) {
                var split_data = data.split("^^THIS IS A SEPARATOR^^");
                var entity_data = split_data[0];
                var key_data = split_data[1];
                localStorage.set("ffg_league_lastpk", parseInt(key_data));
                em.manager.clear();
                em.manager.importEntities(entity_data, {
                    mergeStrategy: breeze.MergeStrategy.OverwriteChanges
                });
                em.manager.acceptChanges();
                var tnmts = _.sortBy(em.manager.getEntities('Tournament'), 'pk');
                em.set_current_tournament(_.first(tnmts));
                em.save();
                try {
                    ctl.initialize();
                } catch (e) {}
            }
            self.finish();
        };
    };
    return new ImportExport();
}]);
app.factory('autoscroll', ["$window", "$timeout", function($window, $timeout) {
    var Autoscroll = function() {
        var self = this;
        self.autoscroll = false;
        self.scrollSpeed = self.scrollSpeed ? self.scrollSpeed : 25;
        self.scrollDir = self.scrollDir ? self.scrollDir : 1;
        self.initialize = function() {
            self.listen();
        };
        self.listen = function() {
            self.promise = $timeout(self.autoScrollFunc, 0);
        };
        self.setActive = function(status) {
            self.autoscroll = status;
            self.listen();
        };
        self.setSpeed = function(speed) {
            self.scrollSpeed = speed;
            self.listen();
        };
        self.autoScrollFunc = function() {
            $timeout.cancel(self.autoScrollPromise);
            var $ = $window.$,
                elm = $('body'),
                window = $window;
            if (self.scrollDir === 1 && $(window).scrollTop() + $(window).height() >= elm.height()) {
                self.scrollDir = -1;
            } else if (self.scrollDir === -1 && $(window).scrollTop() === 0) {
                self.scrollDir = 1;
            }
            if (self.autoscroll) {
                var offset = $(window).scrollTop() + Math.ceil((self.scrollSpeed * self.scrollDir) / 5);
                elm.finish();
                elm.animate({
                    scrollTop: offset
                }, 200, 'linear');
                console.log('autoscroll: ' + self.autoscroll + " to " + offset);
            }
            self.autoScrollPromise = $timeout(self.autoScrollFunc, 200);
        };
    };
    return new Autoscroll();
}]);
app.factory('formats', ['$window', function($window) {
    return $window.formats;
}]);
app.service('timer', ["$window", "$timeout", "$route", "underscore", "localStorage", "localStoragePrefix", models.Timer]);
app.controller("HeaderCtl", ["$scope", "$location", function($scope, $location, $route) {
    var self = $scope.ctl = this;
    $scope.$location = $location;
}]);
app.controller("HomeCtl", ["$window", "$scope", "underscore", "navigate", "entityManager", "localStorage", "localStoragePrefix", "sessionStorage", "import-export", function($window, $scope, _, nav, em, ls, pfx, ss, port) {
    var self = $scope.ctl = this;
    _.extend($scope, {
        '_': _,
        'import_export': port,
    });
    self.initialize = function() {
        self.go = nav.go;
        var is_ppnt_null = function(ppnt) {
            return _.isNull(ppnt.first_name) && ppnt.first_name == ppnt.last_name;
        };
        _.each(em.manager.getEntities('Tournament'), function(tnmt) {
            if ((_.isEmpty(tnmt.participants) || _.all(tnmt.participants, is_ppnt_null)) && tnmt.current_round == 0) {
                tnmt.delete();
            }
        });
        em.manager.acceptChanges();
        self.tnmts = em.manager.getEntities('Tournament');
        self.tnmt = em.get_current_tournament();
    };
    self.delete_tnmt = function(tnmt) {
        tnmt.delete();
        em.manager.acceptChanges();
        self.tnmts = em.manager.getEntities('Tournament');
        if (self.tnmt.entityAspect.entityState.isDetached()) {
            self.tnmt = _.first(self.tnmts)
        }
        em.save();
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
    };
    self.new_tnmt = function() {
        var msg = "Are you sure?  Starting a new tournament will close the current tournament.";
        msg += "  If you're not sure, cancel this action and export your tournament first.";
        if (!$window.utils.is_null_or_undefined(self.tnmt)) {
            if (!$window.confirm(msg)) {
                return;
            }
        }
        var tnmt = em.manager.createEntity('Tournament');
        em.save();
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        ls.set(pfx + "tnmt_key", tnmt.pk);
        self.go('/new-1');
    };
    self.initialize();
}]);
app.controller("NewCtl", ["$rootScope", "$scope", "$window", "timer", "underscore", "navigate", "localStorage", "localStoragePrefix", "sessionStorage", "entityManager", function($rootScope, $scope, $window, timer, _, nav, ls, pfx, ss, em) {
    var self = $scope.ctl = this;
    $scope._ = _;
    self.initialize = function() {
        self.go = nav.go;
        self.resolution_strategies = $window.resolution_strategies;
        self.bye_strategies = $window.bye_strategies;
        self.tiebreakers = $window.utils.tiebreakers;
        self.game_defaults = _.sortBy($window.game_defaults, 'name');
        self.game_templates = _.sortBy($window.game_defaults, 'name');
        self.formats = $window.formats;
        self.tnmt = em.get_current_tournament();
        self.tbkr = null;
        self.format_disabled = false;
        self.game_defaults.push({
            name: 'Custom'
        });
        self.game_templates.splice(0, 0, {
            name: 'Blank'
        });
        try {
            self.update_available_tbkrs();
        } catch (e) {}
    };
    if (!$rootScope.prev_url) {
        switch (nav.path) {
            default:
                case "/new-1":
                $rootScope.prev_url = "/";
            break;
            case "/new-2":
                    $rootScope.prev_url = "/new-1";
                break;
        }
    }
    self.next = function() {
        var next_url = $rootScope.prev_url;
        var is_custom = self.is_custom();
        if (is_custom && $rootScope.prev_url == "/") {
            next_url = "/new-2";
        } else if (is_custom && $rootScope.prev_url == "/new-1") {
            next_url = "/participants";
        } else if (!is_custom && $rootScope.prev_url == "/") {
            next_url = "/participants";
        } else if (!is_custom && $rootScope.prev_url == "/new-1") {
            next_url = "/participants";
        } else {
            next_url = $rootScope.prev_url;
        }
        nav.go(next_url);
    };
    self.is_custom = function() {
        try {
            return self.game_defaults[self.game_idx].name == 'Custom';
        } catch (e) {
            return false;
        }
    };
    self.game_specific_format = function() {
        if (self.game_defaults[self.game_idx].name == 'A Game of Thrones Melee') {
            self.format_pk = "5";
            self.format_disabled = true;
        } else {
            self.format_pk = "1";
            self.format_disabled = false;
        }
    };
    self.update = function(dest) {
        if ($scope.form.$valid) {
            if (!_.isUndefined(self.game_idx)) {
                var settings = em.manager.createEntity('GameSettings');
                var game_tmpl = _.extend({}, self.game_defaults[self.game_idx]);
                if (self.is_custom()) {
                    game_tmpl = self.game_templates[self.template_idx];
                    game_tmpl.name = 'Custom Tournament';
                }
                _.extend(settings, game_tmpl);
                self.tnmt.settings = settings;
                self.tnmt.settings.original_name = game_tmpl.name;
                _.extend(settings, $window.game_overrides['default']);
                _.extend(settings, $window.game_overrides[settings.original_name]);
                _.each(game_tmpl.default_tbkrs, function(tbkr, idx) {
                    tbkr = $window.utils.tiebreakers[tbkr];
                    _.extend(tbkr, {
                        settings: settings
                    }, {
                        order_index: idx + 2
                    });
                    em.manager.createEntity('Tiebreaker', tbkr);
                });
            }
            if (!_.isUndefined(self.format_pk)) {
                self.tnmt.format_pk = self.format_pk;
                self.tnmt.format = formats[self.format_pk];
            }
            _.extend(settings, $window.format_overrides[self.tnmt.format.name]);
            timer.pause();
            timer.set_duration(self.tnmt.settings.round_time * 60);
            timer.set_default(self.tnmt.settings.round_time * 60);
            em.manager.acceptChanges();
            em.save();
            ss.set('tournament_hash', ls.get(pfx + 'hash'));
            self.tnmt.clear_caches();
            self.next();
        }
    };
    self.update_available_tbkrs = function() {
        self.available_tbkrs = _.filter($window.utils.tiebreakers, function(tbkr) {
            var not_score = tbkr.name != "score";
            var not_present = _.every(self.tnmt.settings.tiebreakers, function(t) {
                return t.name != tbkr.name;
            });
            return not_score && not_present;
        });
        self.tnmt.clear_caches();
    };
    self.update_order_indices = function(offset) {
        var offset = offset ? offset + 2 : 2;
        var tbkrs = self.tnmt.settings.tiebreakers;
        _.each(_.sortBy(tbkrs, 'order_index'), function(tbkr, idx) {
            tbkr.order_index = idx + offset;
        });
    };
    self.add_tbkr = function() {
        var tbkrs = self.tnmt.settings.tiebreakers;
        var next_idx = 2;
        try {
            next_idx = _.last(_.sortBy(tbkrs, 'order_index')).order_index + 1;
        } catch (e) {}
        self.edit_tbkr(em.manager.createEntity('Tiebreaker', {
            order_index: next_idx
        }));
    };
    self.edit_tbkr = function(tbkr) {
        self.tbkr = tbkr;
        $window.utils.show_modal('#edit-tiebreaker');
    };
    self.remove_tbkr = function(tbkr) {
        tbkr.entityAspect.setDeleted();
        em.manager.acceptChanges();
        self.update_available_tbkrs();
        self.update_order_indices();
    };
    self.confirm_tbkr = function(save) {
        var tbkrs = self.tnmt.settings.tiebreakers;
        if (save) {
            _.each(_.rest(tbkrs, self.tbkr.order_index - 2), function(tbkr) {
                tbkr.order_index += 1;
            });
            var opts = {
                name: self.tbkr.name,
                pretty_name: self.tiebreakers[self.tbkr.name].pretty_name,
                order_index: self.tbkr.order_index,
                settings: self.tnmt.settings
            };
            _.extend(self.tbkr, opts);
            em.manager.acceptChanges();
        }
        self.update_available_tbkrs();
        self.update_order_indices();
        $window.utils.hide_modal('#edit-tiebreaker');
        self.tbkr = null;
    };
    self.reset_rules = function() {
        em.manager.clear();
        em.load();
        self.initialize();
    };
    self.initialize();
}]);
app.controller("ParticipantCtl", ["$scope", "$window", "$timeout", "navigate", "underscore", "entityManager", "sessionStorage", 'localStorage', 'localStoragePrefix', "debug", function($scope, $window, $timeout, nav, _, em, ss, ls, pfx, debug) {
    var self = $scope.ctl = this;
    self.utils = $window.utils;
    $scope._ = _;
    self.initialize = function() {
        self.email_required = !debug;
        self.cut_size = null;
        self.tnmt = em.get_current_tournament();
        self.ppnts = self.tnmt.participants;
        self.prev_tnmt_q = em.breeze.EntityQuery.from('Tournaments').where('pk', '!=', self.tnmt.pk);
        self.prev_tnmts = em.manager.executeQueryLocally(self.prev_tnmt_q);
        self.can_import_ppnts = (!_.isEmpty(self.prev_tnmts) && ($scope.prev_url == '/new-2' || $scope.prev_url == '/new-1'));
        self.preserve_score = false;
        self.go = nav.go;
        self.manually_pod = false;
        self.current_row = -1;
        self.ppnt_count = 0;
        self.populate();
    };
    self.populate = function() {
        if (_.isEmpty(self.ppnts)) {
            var i;
            for (i = 0; i < 4; i++) {
                self.add_participant(0);
            }
        }
    };
    self.remove_participant = function(ppnt) {
        ppnt.entityAspect.setDeleted();
        self.ppnt_count--;
        em.manager.acceptChanges();
    };
    self._focus_ppnt = function(idx) {
        $timeout(function() {
            try {
                var elm, ppnt_elms = angular.element('td#first_name input');
                if (0 <= idx && idx < _.size(ppnt_elms)) {
                    elm = ppnt_elms[idx]
                } else if (idx === -1) {
                    elm = _.last(ppnt_elms)
                }
                elm.focus();
            } catch (e) {}
        }, 1);
    };
    self.add_participant = function(focus_idx) {
        if ($window.utils.is_null_or_undefined(focus_idx)) {
            focus_idx = -1;
        }
        var opts = {
            tournament: self.tnmt,
            seed: _.size(self.tnmt.participants) + 1
        };
        var mergeStrat = em.breeze.MergeStrategy.SkipMerge;
        em.manager.createEntity('Participant', opts, null, mergeStrat);
        self.ppnt_count++;
        self._focus_ppnt(focus_idx);
    };
    self.start_import = function() {
        $window.utils.show_modal('#import-ppnts');
    };
    self.cancel_import = function() {
        $scope.import = {};
        $window.utils.hide_modal('#import-ppnts');
    };
    self.finish_import = function() {
        _.each(_.clone(self.tnmt.participants), function(ppnt, idx) {
            if (ppnt.is_empty()) {
                self.remove_participant(ppnt);
            }
        });
        var ppnts = $scope.import.prev_tnmt.sorted_ppnts(),
            new_ppnt;
        _.each(_.first(ppnts, $scope.import.cut_size), function(ppnt, idx) {
            new_ppnt = {
                first_name: ppnt.first_name,
                last_name: ppnt.last_name,
                email: ppnt.email,
                phone_number: ppnt.phone_number,
                ffg_id: ppnt.ffg_id,
                tournament_pk: self.tnmt.pk,
                seed: idx + 1
            };
            if (self.preserve_score) {
                console.log(new_ppnt.first_name + ": " + ppnt.total_points());
                new_ppnt.base_points = ppnt.total_points();
                new_ppnt.base_margin_of_victory = ppnt.margin_of_victory()
            }
            em.manager.createEntity('Participant', new_ppnt);
        });
        self.tnmt.parent = $scope.import.prev_tnmt;
        $scope.import.prev_tnmt.cut_size = $scope.cut_size;
        self.cancel_import();
    };
    self.reset = function() {
        var msg = "Are you sure you want to reset your changes?";
        msg += "  If you're not sure, cancel this action.";
        if (!$window.confirm(msg)) {
            return;
        }
        em.manager.clear();
        em.load();
        var ppnt_number = self.ppnt_count;
        self.initialize();
        for (var i = self.ppnt_count; i < ppnt_number; i++) {
            self.add_participant(0);
        }
    };
    self.update = function(dest) {
        var valid_pods = true;
        _.forEach(self.ppnts, function(ppnt) {
            if (self.manually_pod && ppnt.pod == -1) {
                valid_pods = false;
            }
        });
        if ($scope.form.$valid && valid_pods) {
            if (self.random_seeds && self.tnmt.current_round == 0) {
                self.randomize_seeds();
            }
            em.manager.acceptChanges();
            _.each(self.prev_tnmts, function(tnmt) {
                if (_.isEmpty(tnmt.children)) {
                    tnmt.delete();
                }
            });
            if ($scope.prev_url == '/new-2') {
                em.save_state(self.tnmt.name + " - Beginning of Round 0");
            }
            em.save();
            ss.set('tournament_hash', ls.get(pfx + 'hash'));
            self.go(dest);
        }
    };
    self.randomize_seeds = function() {
        var seeds = _.shuffle(_.range(_.size(self.tnmt.participants)));
        var i = 0;
        for (i; i < _.size(self.tnmt.participants); i++) {
            self.tnmt.participants[i].seed = seeds[i] + 1;
        }
    };
    angular.element('body').on('keydown.participant', function(e) {
        switch (e.keyCode) {
            case 13:
                if (self.current_row + 1 == _.size(self.ppnts)) {
                    self.add_participant();
                    self._focus_ppnt(self.current_row + 1);
                } else {
                    self._focus_ppnt(self.current_row + 1);
                }
                break;
        }
    });
    self.initialize();
}]);
app.controller("DashboardCtl", ["$scope", "$window", "$timeout", "$sce", "stateMetaKey", "navigate", "underscore", "localStorage", "localStoragePrefix", "sessionStorage", "entityManager", "timer", "import-export", function($scope, $window, $timeout, $sce, meta_key, nav, _, ls, localStoragePrefix, ss, em, timer, port) {
    var self = $scope.ctl = this;
    self.go = nav.go;
    _.extend($scope, {
        '_': _,
        'timer': timer,
        'import_export': port,
        'assign_pods': $window.utils.assign_pods,
        'cut': {}
    });
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        self.current_row = -1;
        self.formats = $window.formats;
        self.game_defaults = _.sortBy($window.game_defaults, 'name');
        self.update_states();
        self.format_disabled = false;
        ss.set('tournament_hash', ls.get(localStoragePrefix + 'hash'));
        timer.initialize(60 * self.tnmt.settings.round_time);
    };
    self.check_hash = function() {
        var local_hash = ls.get(localStoragePrefix + 'hash');
        var session_hash = ss.get('tournament_hash');
        if (local_hash != session_hash) {
            $window.utils.show_modal('#multiple-dashboards');
        } else {
            $window.utils.hide_modal('#multiple-dashboards');
        }
    };
    $window.onfocus = self.check_hash;
    self.fetch_participant_scorecard = function(ppnt) {
        return $sce.trustAsHtml(ppnt.get_scorecard_link());
    };
    self.get_factions = function() {
        var factions = {};
        if (self.tnmt.settings.uses_factions) {
            factions = self.tnmt.settings.factions;
        }
        return factions;
    };
    self.pair_manually = function() {
        self.tnmt.current_round += 1;
        self.go('/edit-pairings');
    };
    self.seed_round = function() {
        if ($scope.pairingsform.$valid) {
            if (self.tnmt.current_round > 0) {
                self.save_state("End of Round " + self.tnmt.current_round);
            }
            self.tnmt.format.generate_pairings(self.tnmt);
            timer.pause();
            timer.set_duration(60 * self.tnmt.settings.round_time);
            em.manager.acceptChanges();
            em.save();
            ss.set('tournament_hash', ls.get(localStoragePrefix + 'hash'));
        }
    };
    self.reseed_round = function() {
        var matches = self.tnmt.get_matches(self.tnmt.current_round);
        _.each(matches, function(match) {
            if (match.is_bye()) {
                match.matchparticipants[0].participant.has_received_bye = false;
            }
            match.delete();
        });
        self.save_changes();
        self.tnmt.current_round--;
        self.tnmt.format.generate_pairings(self.tnmt);
        self.save_changes();
    };
    self.can_assign_pods = function() {
        var ppnts = self.tnmt.participants;
        var pods = _.all(ppnts, function(ppnt) {
            return ppnt.pod == -1;
        });
        var name = self.tnmt.format.name == 'Draft';
        return pods && name;
    };
    self.assign_pods = function(tnmt) {
        utils.assign_pods(tnmt);
        self.save_changes();
    };
    self.change_role = function(mch_ppnt) {
        console.assert(_.size(mch_ppnt.match.matchparticipants) == 2, "Match with role should be two player only");
        if (mch_ppnt.role > 0) {
            var opponent = mch_ppnt.get_opponents()[0];
            if (mch_ppnt.role == 1) {
                opponent.role = 2;
            } else {
                opponent.role = 1;
            }
        }
        self.save_changes();
    };
    self.change_winner = function(mch_ppnt) {
        var is_winner = false;
        if (mch_ppnt.is_winner) {
            is_winner = true;
        }
        _.forEach(mch_ppnt.match.matchparticipants, function(participant) {
            participant.is_winner = false;
        });
        if (is_winner) {
            mch_ppnt.is_winner = true;
        }
        self.save_changes();
    };
    self.set_scores = function(mch, scores) {
        self.current_match = mch;
        if (!_.isUndefined(scores)) {
            if (self.current_match.matchparticipants.length == scores.length) {
                _.each(self.current_match.matchparticipants, function(mmpnt, idx) {
                    mmpnt.points_earned = scores[mmpnt.table_seat];
                });
                self.apply_scores(true);
            }
        } else {
            _.each(self.current_match.matchparticipants, function(mmpnt, idx) {
                mmpnt.points_earned = 0;
            });
            self.apply_scores(true);
        }
    };
    self.apply_scores = function(save) {
        if (save) {
            var all_blank = _.all(self.current_match.matchparticipants, function(mppnt) {
                return utils.is_null_or_undefined(mppnt.points_earned);
            });
            if (!all_blank) {
                _.each(self.current_match.matchparticipants, function(mppnt, idx) {
                    if (utils.is_null_or_undefined(mppnt.points_earned)) {
                        mppnt.points_earned = 0;
                    }
                });
            }
            self.tnmt.settings.score_callback(self.current_match);
            em.manager.acceptChanges();
            self.current_match = null;
            em.save();
            ss.set('tournament_hash', ls.get(localStoragePrefix + 'hash'));
            self.tnmt.clear_caches();
        } else {
            em.manager.rejectChanges();
        }
    };
    self.save_changes = function() {
        em.manager.acceptChanges();
        em.save();
        ss.set('tournament_hash', ls.get(localStoragePrefix + 'hash'));
        self.tnmt.clear_caches();
    };
    self.start_cut = function() {
        $window.utils.show_modal('#cut-to-top');
        self.game_specific_format();
    };
    self.game_specific_format = function() {
        if (self.tnmt.settings.original_name == 'A Game of Thrones Melee') {
            $scope.cut.format_pk = "5";
            self.format_disabled = true;
        } else {
            $scope.cut.format_pk = "1";
            self.format_disabled = false;
        }
    };
    self.finish_cut = function() {
        var msg = "Are you sure? Making a cut will close the current tournament.";
        msg += "  If you're not sure, cancel this action and export this tournament first.";
        if (!confirm(msg)) {
            return self.cancel_cut();
        }
        var settings = em.manager.createEntity('GameSettings', self.tnmt.settings.clone());
        var tnmt = em.manager.createEntity('Tournament', self.tnmt.clone());
        _.each(self.tnmt.settings.tiebreakers, function(tbkr, idx) {
            var new_tbkr = em.manager.createEntity('Tiebreaker', tbkr.clone());
            new_tbkr.settings = settings;
        });
        _.each(_.first(self.tnmt.sorted_active_ppnts(), $scope.cut.size), function(ppnt, idx) {
            var new_ppnt = em.manager.createEntity('Participant', ppnt.clone());
            new_ppnt.seed = idx + 1;
            new_ppnt.tournament = tnmt;
            new_ppnt.swiss_id = 0;
            new_ppnt.pod = -1;
            new_ppnt.is_active = true;
            new_ppnt.has_received_bye = false;
            new_ppnt.reward_byes = 0;
            if ($scope.cut.preserve_scores) {
                new_ppnt.base_points = ppnt.total_points();
                new_ppnt.base_margin_of_victory = ppnt.margin_of_victory();
            } else {
                new_ppnt.base_points = 0;
                new_ppnt.base_margin_of_victory = 0;
            }
        });
        tnmt.settings = settings;
        tnmt.settings.round_time = settings.round_time;
        tnmt.name = $scope.cut.name;
        tnmt.parent_pk = self.tnmt.pk;
        tnmt.format_pk = $scope.cut.format_pk;
        tnmt.format = self.formats[tnmt.format_pk];
        _.extend(settings, $window.format_overrides[self.tnmt.format.name]);
        tnmt.current_round = 0;
        self.tnmt.cut_size = $scope.cut.size;
        em.manager.acceptChanges();
        em.set_current_tournament(tnmt);
        em.save();
        ss.set('tournament_hash', ls.get(localStoragePrefix + 'hash'));
        $window.utils.hide_modal('#cut-to-top');
        self.initialize();
    };
    self.cancel_cut = function() {
        $window.utils.hide_modal('#cut-to-top');
        $scope.cut = {};
    };
    self.update_states = function() {
        self.saved_states = _.filter(ls.get(meta_key), function(state, idx) {
            return state.tnmt_pk == self.tnmt.pk;
        });
    };
    self.get_state_memo = function() {
        $window.utils.show_modal('#save-state-memo');
    };
    self.save_state = function(memo) {
        var memo_elm_id = '#save-state-memo';
        var memo_elm = angular.element(memo_elm_id);
        if (!_.isNull(memo)) {
            $window.utils.hide_modal(memo_elm_id);
        }
        if (!_.isUndefined(memo)) {
            memo = self.tnmt.name + " - " + memo;
            self.save_changes();
            em.save_state(memo);
        }
        memo_elm.find('#memo').val("");
        self.update_states();
    };
    self.load_state = function(memo) {
        if ($window.confirm('Are you sure you want restore a previous state?')) {
            em.load_state(memo);
        }
    };
    self.delete_state = function(memo) {
        em.delete_state(memo);
        self.update_states();
    };
    self._focus_match = function(idx) {
        $timeout(function() {
            try {
                var elm, ppnt_elms = angular.element('input#first-points-destroyed');
                if (0 <= idx && idx < _.size(ppnt_elms)) {
                    elm = ppnt_elms[idx]
                } else if (idx === -1) {
                    elm = _.last(ppnt_elms)
                }
                elm.focus();
            } catch (e) {}
        }, 1);
    };
    angular.element('body').on('keydown.dashboard', function(e) {
        switch (e.keyCode) {
            case 13:
                if (self.current_row >= 0) {
                    self._focus_match(self.current_row + 1);
                }
        }
    });
    self.initialize();
}]);
app.controller("LeaderboardCtl", ['$scope', '$timeout', '$window', 'timer', 'underscore', 'entityManager', 'autoscroll', function($scope, $timeout, $window, timer, _, em, scroll) {
    var self = $scope.ctl = this;
    self.interval = 30000;
    $scope.timer = timer;
    _.extend($scope, {
        'autoscroll': scroll
    });
    self.initialize = function() {
        $window.scope = $scope;
        self.tnmt = em.get_current_tournament();
        timer.initialize();
    };
    self.timeoutFunc = function() {
        em.load();
        self.leaderboard_info = [];
        var tnmt = {
            parent: em.get_current_tournament(),
            cut_size: 0
        };
        while (!_.isNull(tnmt.parent)) {
            tnmt = tnmt.parent;
            self.leaderboard_info.push({
                tnmt: tnmt,
                offset: tnmt.cut_size
            });
        }
        self.promise = $timeout(self.timeoutFunc, self.interval);
    };
    self.promise = $timeout(self.timeoutFunc, 0);
    self.initialize();
}]);
app.controller("RoundViewCtl", ['$window', '$scope', '$routeParams', '$timeout', '$location', 'timer', 'underscore', 'localStorage', 'localStoragePrefix', 'sessionStorage', 'entityManager', 'autoscroll', function($window, $scope, $routeParams, $timeout, $location, timer, _, ls, pfx, ss, em, scroll) {
    var self = $scope.ctl = this;
    _.extend($scope, {
        "_": _,
        "timer": timer,
        "$location": $location,
        "autoscroll": scroll
    });
    self.tnmt = em.get_current_tournament();
    $window.$location = $location;
    self.check_hash = function() {
        var local_hash = ls.get(pfx + 'hash');
        var session_hash = ss.get('tournament_hash');
        if (local_hash != session_hash) {
            $window.utils.show_modal('#multiple-dashboards');
        } else {
            $window.utils.hide_modal('#multiple-dashboards');
        }
    };
    $window.onfocus = self.check_hash;
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        self.round_num = parseInt($routeParams.round_num);
        self.matches = self.tnmt.get_matches(self.round_num);
        self.can_edit = self.round_num == self.tnmt.current_round;
        self.interval = 30000;
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        timer.initialize();
    };
    self.timeoutFunc = function() {
        em.load();
        self.initialize();
        self.promise = $timeout(self.timeoutFunc, self.interval);
    };
    self.save_changes = function($event) {
        var element = $(event.target.parentNode.parentNode.parentNode);
        element.addClass('confirmation-flash');
        setTimeout(function() {
            element.removeClass("confirmation-flash");
        }, 501);
        em.manager.acceptChanges();
        em.save();
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        self.tnmt.clear_caches();
    };
    angular.element('body').off('keydown.roundview');
    angular.element('body').on('keydown.roundview', function(e) {
        switch (e.keyCode) {
            case 37:
                angular.element('a#prev:visible').click();
                break;
            case 39:
                angular.element('a#next:visible').click();
                break;
        }
    });
    self.promise = $timeout(self.timeoutFunc, 0);
}]);
app.controller("RoundEditCtl", ['$rootScope', '$scope', '$window', 'timer', 'underscore', 'localStorage', 'localStoragePrefix', 'sessionStorage', 'navigate', 'entityManager', function($rootScope, $scope, $window, timer, _, ls, pfx, ss, nav, em) {
    var self = $scope.ctl = this;
    self.go = nav.go;
    _.extend($scope, {
        "_": _,
        "timer": timer
    });
    $rootScope.next_url = '/dashboard';
    if (_.isUndefined($rootScope.prev_url)) {
        $rootScope.prev_url = '/dashboard';
    }
    self.check_hash = function() {
        var local_hash = ls.get(pfx + 'hash');
        var session_hash = ss.get('tournament_hash');
        if (local_hash != session_hash) {
            $window.utils.show_modal('#multiple-dashboards');
        } else {
            $window.utils.hide_modal('#multiple-dashboards');
        }
    };
    $window.onfocus = self.check_hash;
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        self.inactive_ppnts = self.tnmt.get_active_ppnts(undefined, false);
        self._new_ppnts = [];
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        timer.initialize();
    };
    self.new_ppnts = function(item) {
        if (utils.is_null_or_undefined(item)) {
            return self._new_ppnts;
        } else {
            var idx = item[0],
                ppnt = item[1];
            if (ppnt == "") {
                ppnt = null;
                self.unpaired_ppnts.push(self._new_ppnts[idx]);
            } else {
                self.unpaired_ppnts = _.without(self.unpaired_ppnts, ppnt);
            }
            self._new_ppnts[idx] = ppnt;
        }
    };
    self.clear_ppnt = function(idx) {
        var ppnt = self._new_ppnts[idx];
        self._new_ppnts = _.without(self._new_ppnts, ppnt);
        self.unpaired_ppnts.push(ppnt);
    };
    self.update_unpaired_ppnts = function() {
        self.unpaired_ppnts = [];
        _.each(self.tnmt.participants, function(ppnt, idx) {
            if (!ppnt.has_match() && ppnt.is_active) {
                self.unpaired_ppnts.push(ppnt);
            }
        });
    };
    self.delete_match = function(mch) {
        while (_.size(mch.matchparticipants) > 0) {
            mch.matchparticipants[0].entityAspect.setDeleted();
        }
        mch.entityAspect.setDeleted();
        em.manager.acceptChanges();
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        self.update_unpaired_ppnts();
    };
    self.create_match = function() {
        self.table_number = self.tnmt.get_next_table();
        $window.utils.show_modal('#add-match');
    };
    self.confirm_new_match = function(save) {
        if ($scope.form.$valid) {
            if (save) {
                self.tnmt.create_match(self._new_ppnts, null, null, self.table_number);
                ss.set('tournament_hash', ls.get(pfx + 'hash'));
            }
            self._new_ppnts = [];
            $window.utils.hide_modal('#add-match');
            em.manager.acceptChanges();
            self.update_unpaired_ppnts();
        }
    };
    self.confirm = function(dest) {
        if (_.size(self.unpaired_ppnts) > 0) {
            $window.utils.show_error('All players must be assigned to a match.');
            return;
        }
        em.save();
        ss.set('tournament_hash', ls.get(pfx + 'hash'));
        self.go(dest);
    };
    self.cancel = function(dest) {
        em.manager.clear();
        em.load();
        self.go(dest);
    };
    self.initialize();
    self.update_unpaired_ppnts();
}]);
app.controller('MatchSlipCtl', ['$scope', '$window', '$routeParams', 'entityManager', function($scope, $window, $routeParams, em) {
    var self = $scope.ctl = this;
    self.round_num = parseInt($routeParams.round_num);
    self.tnmt = em.get_current_tournament();
    self.now = new Date();
    self.matches = self.tnmt.get_matches(self.round_num);
    self.collated_matches = [];
    self.collate = true;
    self.initialize = function() {
        self.matches = _.filter(self.matches, function(match) {
            return match.order_index >= 0
        });
        self.matches = _.sortBy(self.matches, 'order_index');
        for (var i = 0; i < Math.ceil(_.size(self.matches) / 5); i++) {
            var j = i;
            for (var k = 0; k < 5; k++) {
                if (j < _.size(self.matches)) {
                    self.collated_matches.push(self.matches[j]);
                } else {
                    var mgr = self.tnmt.entityAspect.entityManager;
                    var match = mgr.createEntity('Match', {
                        tournament: self.tnmt,
                        order_index: -1,
                        round: self.tnmt.current_round
                    });
                    self.collated_matches.push(match);
                }
                j += Math.ceil(_.size(self.matches) / 5);
            }
        }
    };
    self.initialize();
}]);
app.controller("ParticipantScoreCtl", ['$scope', '$routeParams', '$timeout', 'underscore', 'entityManager', function($scope, $routeParams, $timeout, _, em) {
    var self = $scope.ctl = this;
    $scope._ = _;
    var ppnt_id = -1 * parseInt($routeParams.ppnt_id);
    self.interval = 30000;
    self.initialize = function() {
        self.ppnt = em.manager.getEntityByKey("Participant", ppnt_id);
        self.tnmt = em.get_current_tournament();
    };
    self.timeoutFunc = function() {
        em.load();
        self.initialize();
        self.promise = $timeout(self.timeoutFunc, self.interval);
    };
    self.promise = $timeout(self.timeoutFunc, 0);
}]);
app.controller("TimerCtl", ['$scope', 'timer', 'entityManager', function($scope, timer, em) {
    var self = $scope.ctl = this;
    $scope.timer = timer;
    self.is_standalone = true;
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        timer.initialize();
    };
    self.initialize();
}]);
app.controller("PrintPairingsCtl", ['$scope', '$routeParams', '$window', '$timeout', 'timer', 'entityManager', 'underscore', 'autoscroll', function($scope, $routeParams, $window, $timeout, timer, em, _, scroll) {
    var self = $scope.ctl = this;
    $scope.timer = timer;
    $scope._ = _;
    self.twosplit = false;
    self.foursplit = false;
    self.initialize = function() {
        self.round_num = parseInt($routeParams.round_num);
        self.tnmt = em.get_current_tournament();
        self.mppnts = [];
        self.twomppnts = [];
        self.fourmppnts = [];
        self.interval = 30000;
        self.split_array = ['f', 'm', 's'];
        _.extend($scope, {
            'autoscroll': scroll
        });
        _.each(self.tnmt.get_matches(self.round_num), function(match) {
            _.each(match.matchparticipants, function(mppnt, idx) {
                self.mppnts.push({
                    pod: mppnt.participant.pod,
                    table: match.order_index,
                    first_name: mppnt.participant.first_name,
                    last_name: mppnt.participant.last_name,
                    link: mppnt.participant.get_scorecard_link(),
                    opponents: mppnt.get_opponents()
                })
            });
        });
        var ppnts = self.mppnts;
        _.each(self.split_array, function(letter) {
            var chunk = _.filter(ppnts, function(ppnt) {
                return ppnt.last_name.toLowerCase() < letter;
            });
            ppnts = _.difference(ppnts, chunk);
            self.fourmppnts.push(chunk);
        });
        self.fourmppnts.push(ppnts);
        self.twomppnts.push(self.fourmppnts[0].concat(self.fourmppnts[1]));
        self.twomppnts.push(self.fourmppnts[2].concat(self.fourmppnts[3]));
        timer.initialize();
    };
    self.switch = function(flag) {
        if (flag == 'two') {
            self.foursplit = false;
        } else if (flag == 'four') {
            self.twosplit = false;
        }
    };
    self.timeoutFunc = function() {
        em.load();
        self.initialize();
        self.promise = $timeout(self.timeoutFunc, self.interval);
    };
    self.promise = $timeout(self.timeoutFunc, 0);
}]);
app.controller("PrintPodsCtl", ['$scope', '$timeout', 'timer', 'entityManager', 'underscore', function($scope, $timeout, timer, em, _) {
    var self = $scope.ctl = this;
    $scope.timer = timer;
    $scope._ = _;
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        timer.initialize();
    };
    self.timeoutFunc = function() {
        em.load();
        self.initialize();
        self.promise = $timeout(self.timeoutFunc, self.interval);
    };
    self.promise = $timeout(self.timeoutFunc, 0);
}]);
app.controller("PrintMeetingCtl", ['$scope', 'entityManager', 'underscore', 'autoscroll', function($scope, em, _, scroll) {
    var self = $scope.ctl = this;
    self.tables = [];
    _.extend($scope, {
        'autoscroll': scroll
    });
    self.initialize = function() {
        self.tnmt = em.get_current_tournament();
        var participants = self.tnmt.get_active_ppnts();
        participants = _.sortBy(participants, 'last_name');
        while (_.size(participants) > 0) {
            var table = _.take(participants, 2);
            participants = _.rest(participants, 2);
            self.tables.push(table);
        }
    };
    self.initialize();
}]);


// controllers.js ^^^^^


var resolution_strategies = (function() {
    return [{
        name: "grant_byes",
        pretty_name: "Grant Byes"
    }, {
        name: "small_matches",
        pretty_name: "Create small matches"
    }];
}());
var bye_strategies = (function() {
    return [{
        name: "lowest",
        pretty_name: "Lowest"
    }, {
        name: "highest",
        pretty_name: "Highest"
    }, {
        name: "random",
        pretty_name: "Random"
    }];
}());
var game_defaults = (function() {
    return [{
        name: "Android: Netrunner",
        min_players: 2,
        max_players: 2,
        bye_strategy: 'lowest',
        win_points: 6,
        win_mov: 0,
        draw_points: 2,
        bye_points: 6,
        bye_mov: 0,
        round_time: 65,
        resolution_strategy: 'grant_byes',
        logo: 'img/adn01_logo.jpg',
        uses_factions: true,
        uses_identities: true,
        uses_winner: false,
        identity_name: "Identity",
        number_of_roles: 2,
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Call of Cthulhu",
        min_players: 2,
        max_players: 2,
        win_points: 5,
        win_mov: 0,
        draw_points: 2,
        bye_strategy: 'lowest',
        bye_points: 5,
        bye_mov: 0,
        round_time: 50,
        resolution_strategy: 'grant_byes',
        logo: 'img/ct01_logo.jpg',
        uses_factions: false,
        uses_identities: false,
        uses_winner: false,
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "A Game of Thrones Joust",
        min_players: 2,
        max_players: 2,
        win_points: 5,
        win_mov: 0,
        bye_strategy: 'lowest',
        bye_points: 5,
        bye_mov: 0,
        round_time: 55,
        resolution_strategy: 'grant_byes',
        logo: 'img/got01_logo.jpg',
        uses_factions: true,
        uses_identities: true,
        uses_winner: false,
        identity_name: "Agenda",
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "A Game of Thrones Melee",
        min_players: 3,
        max_players: 4,
        win_points: 15,
        win_mov: 0,
        draw_points: 0,
        bye_points: 15,
        bye_margin: 0,
        round_time: 105,
        resolution_strategy: 'small_matches',
        logo: 'img/got01_logo.jpg',
        uses_factions: true,
        uses_identities: true,
        uses_winner: true,
        identity_name: "Agenda",
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Star Wars: Armada",
        min_players: 2,
        max_players: 2,
        win_points: 10,
        win_mov: 0,
        bye_points: 8,
        bye_mov: 140,
        bye_strategy: 'lowest',
        round_time: 135,
        resolution_strategy: 'grant_byes',
        logo: 'img/swm01_logo.jpg',
        uses_factions: true,
        uses_identities: false,
        uses_winner: true,
        default_tbkrs: ['margin_of_victory', 'str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Star Wars: The Card Game",
        min_players: 2,
        max_players: 2,
        win_points: 6,
        win_mov: 0,
        draw_points: 2,
        bye_strategy: 'lowest',
        bye_points: 6,
        bye_mov: 0,
        round_time: 70,
        resolution_strategy: 'grant_byes',
        logo: 'img/swc01_logo.jpg',
        number_of_roles: 2,
        uses_factions: true,
        uses_identities: false,
        uses_winner: false,
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Star Wars: Imperial Assault",
        min_players: 2,
        max_players: 2,
        win_points: 1,
        win_mov: 0,
        bye_points: 1,
        bye_mov: 0,
        bye_strategy: 'lowest',
        round_time: 65,
        resolution_strategy: 'grant_byes',
        logo: 'img/swi01_logo.jpg',
        uses_factions: true,
        uses_identities: false,
        uses_winner: false,
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Star Wars: X-wing Miniatures Game",
        min_players: 2,
        max_players: 2,
        win_points: 1,
        win_mov: 0,
        bye_points: 1,
        bye_mov: 150,
        uses_mov: true,
        bye_strategy: 'lowest',
        round_time: 75,
        resolution_strategy: 'grant_byes',
        logo: 'img/swx01_logo.jpg',
        uses_factions: true,
        uses_identities: false,
        uses_winner: true,
        default_tbkrs: ['margin_of_victory', 'str_of_sched', 'ext_str_of_sched', 'random']
    }, {
        name: "Warhammer 40,000: Conquest",
        min_players: 2,
        max_players: 2,
        win_points: 5,
        win_mov: 0,
        bye_points: 5,
        bye_mov: 0,
        bye_strategy: 'lowest',
        round_time: 55,
        resolution_strategy: 'grant_byes',
        logo: 'img/whk01_logo.jpg',
        uses_factions: true,
        uses_identities: true,
        uses_winner: false,
        identity_name: 'Warlord',
        default_tbkrs: ['str_of_sched', 'ext_str_of_sched', 'random']
    }];
}());
var game_overrides = (function() {
    return {
        "default": {
            "templates": {
                "print_pairings": "generic/print_pairings.html",
                "match_slip": "generic/match_slip.html",
                "pairings": {
                    'Swiss': 'swiss/current_pairings.html',
                    'Single Elimination': 'se/current_pairings.html',
                    'Double Elimination': 'de/current_pairings.html',
                    'Draft': 'draft/current_pairings.html',
                    'Random': 'generic/current_pairings.html'
                }
            },
            "score_callback": function(match) {
                return undefined;
            },
            "get_pairings_partial": function(tnmt) {
                return this.templates.pairings[tnmt.format.name];
            }
        },
        "Star Wars: X-wing Miniatures Game": {
            factions: {
                factions: ['Imperial', 'Rebel', 'Scum']
            },
            "templates": {
                "print_pairings": "generic/print_pairings.html",
                "match_slip": "xwing/match_slip.html",
                "pairings": {
                    'Swiss': 'xwing/swiss_current_pairings.html',
                    'Single Elimination': 'xwing/se_current_pairings.html',
                    'Double Elimination': 'xwing/de_current_pairings.html',
                    'Draft': 'xwing/draft_current_pairings.html',
                    'Random': 'xwing/current_pairings.html'
                }
            },
            "score_callback": function(match) {
                console.assert(_.size(match.matchparticipants) == 2);
                var mppnts = _.sortBy(match.matchparticipants, 'raw_score');
                var score_difference = mppnts[1].raw_score - mppnts[0].raw_score;
                if (score_difference == 0) {
                    mppnts[0].margin_of_victory = 100;
                    mppnts[1].margin_of_victory = 100;
                    if (mppnts[0].is_winner) {
                        mppnts[0].points_earned = 1;
                        mppnts[1].points_earned = 0;
                    } else {
                        mppnts[0].points_earned = 0;
                        mppnts[1].points_earned = 1;
                    }
                } else {
                    mppnts[0].points_earned = 0;
                    mppnts[0].margin_of_victory = 100 - score_difference;
                    mppnts[1].points_earned = 1;
                    mppnts[1].margin_of_victory = 100 + score_difference;
                }
            }
        },
        "Star Wars: Armada": {
            factions: {
                factions: ['Imperial', 'Rebel']
            },
            "templates": {
                "match_slip": "armada/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'armada/swiss_current_pairings.html',
                    'Single Elimination': 'armada/se_current_pairings.html',
                    'Double Elimination': 'armada/de_current_pairings.html',
                    'Draft': 'armada/draft_current_pairings.html',
                    'Random': 'armada/current_pairings.html'
                }
            },
            "score_callback": function(match) {
                console.assert(_.size(match.matchparticipants) == 2);
                var mppnts = _.sortBy(match.matchparticipants, 'raw_score');
                var margin = Math.max(0, mppnts[1].raw_score - mppnts[0].raw_score);
                margin = Math.min(400, margin);
                mppnts[0].margin_of_victory = 0;
                mppnts[1].margin_of_victory = margin;
                if (margin == 0) {
                    if (mppnts[0].is_winner) {
                        mppnts[0].points_earned = 6;
                        mppnts[1].points_earned = 5;
                    } else {
                        mppnts[0].points_earned = 5;
                        mppnts[1].points_earned = 6;
                    }
                } else if (margin < 60) {
                    mppnts[0].points_earned = 5;
                    mppnts[1].points_earned = 6;
                } else if (60 <= margin && margin < 140) {
                    mppnts[0].points_earned = 4;
                    mppnts[1].points_earned = 7;
                } else if (140 <= margin && margin < 220) {
                    mppnts[0].points_earned = 3;
                    mppnts[1].points_earned = 8;
                } else if (220 <= margin && margin < 300) {
                    mppnts[0].points_earned = 2;
                    mppnts[1].points_earned = 9;
                } else if (300 <= margin) {
                    mppnts[0].points_earned = 1;
                    mppnts[1].points_earned = 10;
                }
            }
        },
        "Android: Netrunner": {
            factions: {
                Runner: ['Anarch', 'Criminal', 'Shaper', 'Mini'],
                Corp: ['HB', 'Jinteki', 'NBN', 'Weyland']
            },
            "templates": {
                "match_slip": "netrunner/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'netrunner/current_pairings.html',
                    'Single Elimination': 'netrunner/se_current_pairings.html',
                    'Double Elimination': 'netrunner/de_current_pairings.html',
                    'Draft': 'netrunner/draft_current_pairings.html',
                    'Random': 'netrunner/current_pairings.html'
                }
            }
        },
        "Star Wars: The Card Game": {
            factions: {
                'Dark Side': ['Imperial Navy', 'Scum and Villany', 'Sith'],
                'Light Side': ['Jedi', 'Rebel Alliance', 'Smugglers and Spies']
            },
            "templates": {
                "match_slip": "swcard/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'swcard/swiss_current_pairings.html',
                    'Single Elimination': 'swcard/se_current_pairings.html',
                    'Double Elimination': 'swcard/de_current_pairings.html',
                    'Draft': 'swcard/draft_current_pairings.html',
                    'Random': 'swcard/current_pairings.html'
                }
            }
        },
        "Star Wars: Imperial Assault": {
            factions: {
                factions: ['Imperial', 'Mercenary', 'Rebel']
            },
            "templates": {
                "match_slip": "assault/match_slip.html",
                "print_pairings": "assault/print_pairings.html",
                "pairings": {
                    'Swiss': 'assault/swiss_current_pairings.html',
                    'Single Elimination': 'assault/se_current_pairings.html',
                    'Double Elimination': 'assault/de_current_pairings.html',
                    'Draft': 'assault/draft_current_pairings.html',
                    'Random': 'assault/current_pairings.html'
                }
            }
        },
        "Call of Cthulhu": {
            "templates": {
                "match_slip": "cthulhu/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'cthulhu/swiss_current_pairings.html',
                    'Single Elimination': 'cthulhu/se_current_pairings.html',
                    'Double Elimination': 'cthulhu/de_current_pairings.html',
                    'Draft': 'cthulhu/draft_current_pairings.html',
                    'Random': 'cthulhu/current_pairings.html'
                }
            }
        },
        "Warhammer 40,000: Conquest": {
            factions: {
                factions: ['Astra Militarum', 'Chaos', 'Dark Eldar', 'Eldar', 'Necrons', 'Orks', 'Space Marines', 'Tau', 'Tyranids']
            },
            "templates": {
                "match_slip": "conquest/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'conquest/swiss_current_pairings.html',
                    'Single Elimination': 'conquest/se_current_pairings.html',
                    'Double Elimination': 'conquest/de_current_pairings.html',
                    'Draft': 'conquest/draft_current_pairings.html',
                    'Random': 'conquest/current_pairings.html'
                }
            }
        },
        "A Game of Thrones Joust": {
            factions: {
                factions: ['Baratheon', 'Greyjoy', 'Lannister', 'Martell', 'Stark', 'Targaryen', 'The Night\'s Watch', 'Tyrell']
            },
            "templates": {
                "match_slip": "joust/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'joust/swiss_current_pairings.html',
                    'Single Elimination': 'joust/se_current_pairings.html',
                    'Double Elimination': 'joust/de_current_pairings.html',
                    'Draft': 'joust/draft_current_pairings.html',
                    'Random': 'joust/current_pairings.html'
                }
            }
        },
        "A Game of Thrones Melee": {
            factions: {
                factions: ['Baratheon', 'Greyjoy', 'Lannister', 'Martell', 'Stark', 'Targaryen', 'The Night\'s Watch', 'Tyrell']
            },
            "templates": {
                "match_slip": "melee/match_slip.html",
                "print_pairings": "generic/print_pairings.html",
                "pairings": {
                    'Swiss': 'melee/swiss_current_pairings.html',
                    'Single Elimination': 'melee/se_current_pairings.html',
                    'Double Elimination': 'melee/de_current_pairings.html',
                    'Draft': 'melee/draft_current_pairings.html',
                    'Random': 'melee/current_pairings.html',
                    'Swiss Melee': 'melee/swiss_current_pairings.html'
                }
            },
            "score_callback": function(match) {
                var winner = null;
                var has_winner = false;
                var sorted_participants = [];
                _.forEach(match.matchparticipants, function(participant) {
                    if (participant.is_winner) {
                        winner = participant;
                        has_winner = true;
                    } else {
                        sorted_participants.push(participant);
                    }
                });
                sorted_participants = _.sortBy(sorted_participants, 'raw_score');
                sorted_participants = sorted_participants.reverse();
                if (has_winner) {
                    sorted_participants.unshift(winner);
                }
                if (has_winner) {
                    sorted_participants[0].points_earned = 15;
                    for (var i = 1; i < sorted_participants.length; i++) {
                        var lowest_tie_place = 0;
                        for (var j = i; j < sorted_participants.length; j++) {
                            if (sorted_participants[i].raw_score == sorted_participants[j].raw_score) {
                                lowest_tie_place = j + 1;
                            } else {
                                break;
                            }
                        }
                        sorted_participants[i].points_earned = Math.floor(sorted_participants[i].raw_score / lowest_tie_place);
                    }
                } else {
                    var deepest_first_tie = 1;
                    for (i = 0; i < sorted_participants.length; i++) {
                        var lowest_tie_place = 0;
                        for (j = i; j < sorted_participants.length; j++) {
                            if (sorted_participants[i].raw_score == sorted_participants[j].raw_score) {
                                lowest_tie_place = j + 1;
                            } else {
                                break;
                            }
                        }
                        if (i == 0 && lowest_tie_place > 1) {
                            deepest_first_tie = lowest_tie_place;
                            var average_score = Math.floor(sorted_participants[i].raw_score / lowest_tie_place);
                            sorted_participants[i].points_earned = Math.floor((average_score * (lowest_tie_place - 1) + 15) / lowest_tie_place);
                        } else if (i == 0) {
                            sorted_participants[i].points_earned = 15;
                        } else if (lowest_tie_place <= deepest_first_tie) {
                            var average_score = Math.floor(sorted_participants[i].raw_score / lowest_tie_place);
                            sorted_participants[i].points_earned = Math.floor((average_score * (lowest_tie_place - 1) + 15) / lowest_tie_place);
                        } else {
                            sorted_participants[i].points_earned = Math.floor(sorted_participants[i].raw_score / lowest_tie_place);
                        }
                    }
                }
            }
        }
    }
}());

// data.js^^

var WIN = 4;
var MODIFIED_WIN = 3;
var DRAW = 2;
var MODIFIED_LOSS = 1;
var LOSS = 0;
var formats = (function() {
    var formats = Object();
    formats[1] = {
        name: "Swiss",
        uses_seed: true,
        uses_role: false,
        generate_pairings: function(tnmt, ppnts) {
            var ppnt, matches;
            var mgr = tnmt.entityAspect.entityManager;
            var max_players = tnmt.settings.max_players;
            if (utils.is_null_or_undefined(ppnts)) {
                tnmt.match_counter = 0;
                tnmt.current_round += 1;
            }
            utils.debug("\n");
            utils.debug("Round " + tnmt.current_round);
            utils.debug("\n");
            ppnts = ppnts ? ppnts : tnmt.get_active_ppnts();
            if (tnmt.current_round == 1) {
                ppnts = _.sortBy(ppnts, 'reward_byes');
                while (_.last(ppnts).reward_byes > 0) {
                    utils.create_reward_bye(tnmt, ppnts.pop());
                }
            }
            if (_.size(ppnts) % 2 == 1) {
                if (tnmt.current_round == 1) {
                    ppnt = _.sample(ppnts);
                    ppnts = _.without(ppnts, ppnt);
                    tnmt.create_match(ppnt);
                } else {
                    var func = utils.bye_strategies[tnmt.settings.bye_strategy];
                    ppnts = func(tnmt, ppnts, 1);
                }
            }
            console.assert(_.size(ppnts) % 2 == 0, "ppnts does not have an even number of players!");
            matches = utils.apply_hungarian_algorithm(tnmt, ppnts);
            matches = utils.match_sort(tnmt, matches);
            _.each(matches, function(match, idx) {
                utils.create_match(tnmt, match);
            });
            mgr.acceptChanges();
        },
        templates: {
            round_zero: 'generic/round_zero.html',
            current_pairings: 'swiss/current_pairings.html',
            leaderboard: 'generic/leaderboard.html',
            round_view: 'swiss/round_view.html',
            participant: "generic/participant.html"
        }
    };
    formats[2] = {
        name: "Single Elimination",
        uses_seed: true,
        uses_role: true,
        seed: function(idx) {
            return idx + 1
        },
        generate_pairings: function(tnmt) {
            var ppnts, i, j;
            var brackets = [];
            var max_players = tnmt.settings.max_players;
            var mgr = tnmt.entityAspect.entityManager;
            tnmt.match_counter = 0;
            utils.debug("Generating Single Elimination pairings for round " + (tnmt.current_round + 1));
            ppnts = tnmt.get_active_ppnts('seed');
            var cutoff_exp = Math.ceil(utils.lgthm(_.size(ppnts), max_players));
            while (_.size(ppnts) < Math.pow(tnmt.settings.max_players, cutoff_exp)) {
                ppnts.push(null);
            }
            ppnts = utils.create_brackets(ppnts, max_players);
            tnmt.current_round += 1;
            ppnts = _.filter(ppnts, function(ppnt) {
                try {
                    return ppnt.count_losses() < 1;
                } catch (e) {
                    return tnmt.current_round == 1;
                }
            });
            utils.debug("Participants: ");
            utils.debug(ppnts);
            while (_.size(ppnts) > 0) {
                pyrs = _.first(ppnts, max_players);
                ppnts = _.rest(ppnts, max_players);
                tnmt.create_match(pyrs);
            }
            var pyrs = [];
            for (i = 0; i < _.size(brackets); i += 1) {
                pyrs = _.reject(brackets[i], function(itm) {
                    return _.isNull(itm) || 1 <= itm.count_losses();
                });
                tnmt.create_match(pyrs);
            }
            mgr.acceptChanges();
        },
        templates: {
            round_zero: "se/round_zero.html",
            current_pairings: "se/current_pairings.html",
            leaderboard: "se/leaderboard.html",
            round_view: "se/round_view.html",
            participant: "se/participant.html"
        }
    };
    formats[3] = {
        name: "Double Elimination",
        uses_seed: true,
        uses_roles: true,
        seed: function(idx) {
            return (idx + 1);
        },
        generate_pairings: function(tnmt) {
            utils.debug("Generating Double Elimination pairings for round " + (tnmt.current_round + 1));
            var i;
            var brackets, winners, losers, ppnts;
            var mgr = tnmt.entityAspect.entityManager;
            var max_players = tnmt.settings.max_players;
            tnmt.match_counter = 0;
            ppnts = tnmt.get_active_ppnts('seed');
            var cutoff_exp = Math.ceil(utils.lgthm(_.size(ppnts), max_players));
            while (_.size(ppnts) < Math.pow(tnmt.settings.max_players, cutoff_exp)) {
                ppnts.push(null);
            }
            brackets = utils.create_brackets(ppnts, max_players);
            tnmt.current_round += 1;
            winners = _.filter(brackets, function(ppnt) {
                try {
                    return ppnt.count_losses() == 0;
                } catch (e) {
                    return tnmt.current_round == 1;
                }
            });
            losers = _.filter(brackets, function(ppnt) {
                try {
                    return ppnt.count_losses() == 1;
                } catch (e) {
                    return tnmt.current_round == 2;
                }
            });
            utils.debug('Winners\' bracket: ');
            utils.debug(winners);
            utils.debug(_.pluck(winners, 'seed'));
            if (_.size(winners) == 1 && _.size(losers) == 1) {
                tnmt.create_match([winners[0], losers[0]]);
            } else {
                while (_.size(losers) > 0 && utils.lgthm(_.size(losers, max_players)) % 1 !== 0) {
                    var round = 0;
                    _.each(losers, function(ppnt) {
                        if (ppnt.most_recent_loss().round > round) {
                            round = ppnt.most_recent_loss().round;
                        }
                    });
                    var recent = _.filter(losers, function(ppnt) {
                        return ppnt.most_recent_loss().round == round;
                    });
                    for (i = 0; i < _.size(recent); i += 1) {
                        utils.debug("Granting bye to " + recent[i].full_name() + ", who lost in round " + (tnmt.current_round - 1));
                        var idx = _.indexOf(losers, recent[i]);
                        tnmt.create_match([losers[idx], null]);
                        losers.splice(idx, 1);
                    }
                }
                if (tnmt.current_round % 2 == 1) {
                    var lost_last_round = _.filter(losers, function(ppnt) {
                        return ppnt.most_recent_loss().round == tnmt.current_round - 1;
                    });
                    var complement = _.filter(losers, function(ppnt) {
                        return ppnt.most_recent_loss().round != tnmt.current_round - 1;
                    });
                    if (_.size(lost_last_round) == _.size(complement)) {
                        losers = [];
                        lost_last_round = utils.double_elim_reverse_helper(lost_last_round);
                        for (i = 0; i < _.size(lost_last_round); i += 1) {
                            losers.push(complement[i]);
                            losers.push(lost_last_round[i]);
                        }
                    }
                }
                utils.debug('Losers\' bracket: ');
                utils.debug(losers);
                utils.debug(_.pluck(losers, 'seed'));
                utils.debug('\n');
                for (i = 0; i < _.size(winners); i += max_players) {
                    ppnts = winners.slice(i, i + max_players);
                    ppnts = _.reject(ppnts, function(ppnt) {
                        return _.isNull(ppnt);
                    });
                    if (_.size(ppnts) > 0) {
                        if (_.size(ppnts) < 2) {
                            ppnts.push(null);
                        }
                        tnmt.create_match(ppnts);
                    }
                }
                for (i = 0; i < _.size(losers); i += max_players) {
                    ppnts = losers.slice(i, i + max_players);
                    ppnts = _.reject(ppnts, function(ppnt) {
                        return _.isNull(ppnt);
                    });
                    if (_.size(ppnts) > 0) {
                        if (_.size(ppnts) < 2) {
                            ppnts.push(null);
                        }
                        tnmt.create_match(ppnts);
                    }
                }
            }
            mgr.acceptChanges();
        },
        templates: {
            round_zero: "generic/round_zero.html",
            current_pairings: "de/current_pairings.html",
            leaderboard: "de/leaderboard.html",
            round_view: "de/round_view.html",
            participant: "de/participant.html"
        }
    };
    formats[4] = {
        name: "Draft",
        uses_seed: true,
        uses_role: false,
        generate_pairings: function(tnmt) {
            var i, j, pods;
            var mgr = tnmt.entityAspect.entityManager;
            tnmt.match_counter = 0;
            tnmt.current_round += 1;
            if (_.all(tnmt.participants, function(ppnt) {
                    return ppnt.pod == -1
                })) {
                pods = utils.assign_pods(tnmt, true);
            } else {
                pods = utils.get_by_pods(tnmt, true);
            }
            if (tnmt.current_round == 1) {
                for (i = 0; i < _.size(pods); i += 1) {
                    var pod = pods[i];
                    if (_.size(pod) % 2 == 1) {
                        var ppnt = _.sample(pod);
                        pod = _.without(pod, ppnt);
                        tnmt.create_match(ppnt);
                    }
                    var half = _.size(pod) / 2;
                    for (j = 0; j < half; j += 1) {
                        tnmt.create_match([pod[j], pod[half + j]]);
                    }
                }
            } else {
                for (i = 0; i < _.size(pods); i += 1) {
                    formats[1].generate_pairings(tnmt, pods[i]);
                }
            }
        },
        templates: {
            round_zero: "draft/round_zero.html",
            current_pairings: "draft/current_pairings.html",
            leaderboard: "draft/leaderboard.html",
            round_view: "draft/round_view.html",
            participant: "draft/participant.html"
        }
    };
    formats[5] = {
        name: "Random",
        uses_seed: false,
        uses_role: false,
        generate_pairings: function(tnmt) {
            var pyrs;
            var mgr = tnmt.entityAspect.entityManager;
            tnmt.match_counter = 0;
            tnmt.current_round += 1;
            var ppnts = tnmt.get_active_ppnts();
            var tables = [];
            if (tnmt.settings.resolution_strategy == 'grant_byes') {
                var leftover_count = ppnts.length % tnmt.settings.max_players;
                ppnts = utils.bye_strategies[tnmt.settings.bye_strategy](tnmt, ppnts, leftover_count);
            }
            ppnts = _.shuffle(ppnts);
            tables = utils.build_tables(tnmt, ppnts);
            _.each(tables, function(table, idx) {
                utils.create_match(tnmt, table);
            });
            mgr.acceptChanges();
        },
        templates: {
            round_zero: "generic/round_zero.html",
            current_pairings: "generic/current_pairings.html",
            leaderboard: "generic/leaderboard.html",
            round_view: "generic/round_view.html",
            participant: "generic/participant.html"
        }
    };
    return formats;
}());
var format_overrides = (function() {
    return {
        "Double Elimination": {
            bye_points: 0
        }
    }
}());

//formats.js ^^^

var models = (function() {
    models = {};
    models.Timer = function Timer($window, $timeout, $route, _, ls, pfx) {
        var self = this;
        self.initialize = function(seconds) {
            if (seconds) {
                self.set_default(seconds);
                self.set_duration(self.default_duration);
            }
            self.listen();
        };
        self.listen = function() {
            self.promise = $timeout(self.update, 0);
        };
        self.update = function() {
            var now = new Date().valueOf();
            self._get_state();
            self._get_duration();
            self._get_epoch();
            self.promise = $timeout(self.update, 1000);
            if (self.running) {
                self.time_remaining = self.duration - parseInt((now - self.epoch) / 1000);
                if (-1 <= self.time_remaining && self.time_remaining < 1) {
                    $window.utils.show_error('Timer expired!', 'Timer');
                }
            }
            self.timestamp = now;
        };
        self.set = function() {
            self.pause();
            $window.utils.show_modal('#timer-input-container');
        };
        self._get_state = function() {
            var ls_state = ls.get(pfx + "timer_state");
            self._set_state(ls_state ? ls_state : 0);
        };
        self._get_duration = function() {
            var new_duration = ls.get(pfx + "timer_duration");
            if (self.duration != new_duration) {
                self.time_remaining = new_duration;
            }
            self.duration = new_duration;
        };
        self._get_epoch = function() {
            self.epoch = ls.get(pfx + "timer_epoch");
        };
        self._set_state = function(state) {
            self.running = state;
            ls.set(pfx + "timer_state", self.running);
        };
        self.start = function() {
            self._set_state(1);
            self.epoch = new Date().valueOf() - 1000;
            ls.set(pfx + "timer_epoch", self.epoch);
        };
        self.pause = function() {
            var now = new Date().valueOf();
            if (self.running) {
                self.set_duration(self.duration - parseInt((now - self.epoch) / 1000));
            }
            self._set_state(0);
        };
        self.set_duration = function(seconds) {
            self.duration = seconds;
            self.time_remaining = self.duration;
            ls.set(pfx + "timer_duration", self.duration);
        };
        self.set_default = function(seconds) {
            self.default_duration = seconds;
        };
        self.save_duration = function(time) {
            var elm_id = '#timer-input-container';
            var elm = angular.element(elm_id);
            var minutes = 0;
            var seconds = 0;
            if (!_.isUndefined(time)) {
                var sep_idx = _.indexOf(time, ":");
                if (sep_idx > 0) {
                    minutes = time.slice(0, sep_idx);
                } else {
                    minutes = 0;
                }
                seconds = time.slice(sep_idx + 1);
                self.set_default(parseInt(minutes) * 60 + parseInt(seconds));
                self.set_duration(self.default_duration);
            }
            minutes = parseInt(self.default_duration / 60).toString();
            seconds = parseInt(self.default_duration % 60).toString();
            if (_.size(minutes) < 2) {
                minutes = '0' + minutes;
            }
            if (_.size(seconds) < 2) {
                seconds = '0' + seconds;
            }
            elm.find('input').val(minutes + ":" + seconds);
            $window.utils.hide_modal(elm_id);
        };
        self.is_standalone = function() {
            return $route.current.templateUrl == 'partials/timer_standalone.html';
        };
    };
    models.Tournament = function Tournament() {
        Tournament.prototype.clone = function() {
            var self = this;
            return {
                name: self.name,
                number_of_rounds: self.number_of_rounds,
                round_length: self.round_length,
                current_round: self.current_round,
                cut_size: self.cut_size,
                settings_pk: self.settings_pk,
                format_pk: self.format_pk,
                parent_pk: self.parent_pk
            };
        };
        Tournament.prototype.delete = function() {
            _.each(this.matches, function(m) {
                try {
                    m.delete();
                } catch (e) {}
            });
            _.each(this.participants, function(ppnt) {
                try {
                    ppnt.entityAspect.setDeleted();
                } catch (e) {}
            });
            this.entityAspect.setDeleted();
        };
        Tournament.prototype.unique_name = function() {
            return this.name + " (" + this.pk + ")";
        };
        Tournament.prototype.is_current_tournament = function() {
            var key = window.localStorage.getItem('ffg_league_tnmt_key');
            return key == this.pk;
        };
        Tournament.prototype.get_next_table = function() {
            var table = 0;
            var matches = _.sortBy(this.get_matches(), function(m) {
                return m.order_index;
            });
            var x;
            while (true) {
                var found_table = true;
                for (x = 0; x < matches.length; x += 1) {
                    if (matches[x].order_index == table) {
                        found_table = false;
                        break;
                    }
                }
                if (found_table) {
                    break;
                } else {
                    table += 1;
                }
            }
            return table;
        };
        Tournament.prototype.table_open = function(table_number) {
            var matches = _.sortBy(this.get_matches(), function(m) {
                return m.order_index;
            });
            var x;
            for (x = 0; x < matches.length; x += 1) {
                if (matches[x].order_index == table_number) {
                    return false;
                }
            }
            return true;
        };
        Tournament.prototype.create_match = function(players, points, margin, order_index) {
            if (players.constructor !== Array) {
                players = [players];
            }
            players = _.filter(players, _.identity);
            var points = _.size(players) > 1 ? null : this.settings.bye_points;
            var margin = _.size(players) > 1 ? null : this.settings.bye_mov;
            return utils.create_match(this, players, points, margin, order_index);
        };
        Tournament.prototype.can_schedule_next_round = function() {
            return this.has_all_round_scores() || this.current_round == 0;
        };
        Tournament.prototype.can_cut = function() {
            return this.has_all_round_scores();
        };
        Tournament.prototype.get_matches = function(round) {
            if (_.isUndefined(round)) {
                round = this.current_round;
            }
            var matches = _.filter(this.matches, function(m) {
                return m.round == round;
            });
            return matches;
        };
        Tournament.prototype.get_matches_by_pod = function(pod, round) {
            var matches = [];
            _.each(this.get_matches(round), function(match, idx) {
                var ppnt = match.matchparticipants[0].participant;
                if (ppnt.pod == pod) {
                    matches.push(match);
                }
            });
            return matches;
        };
        Tournament.prototype.has_any_round_scores = function(round, ignore_byes) {
            var scores_in = 0;
            if (utils.is_null_or_undefined(round)) {
                round = this.current_round;
            }
            if (utils.is_null_or_undefined(ignore_byes)) {
                ignore_byes = true;
            }
            _.each(this.get_matches(round), function(match, idx, lst) {
                if (ignore_byes && _.size(match.matchparticipants) == 1) {
                    return false;
                }
                if (match.has_scores()) {
                    scores_in += 1;
                }
            });
            return scores_in;
        };
        Tournament.prototype.has_all_round_scores = function(round) {
            if (_.isUndefined(round)) {
                round = this.current_round;
            }
            return _.every(this.get_matches(round), function(match, idx, lst) {
                return match.has_scores();
            });
        };
        Tournament.prototype.sort = function(ppnts, reverse) {
            if (_.isUndefined(reverse)) {
                reverse = false;
            }
            var mgr = this.entityAspect.entityManager;
            var tiebreakers = ['score'];
            var tiebreakers_q = breeze.EntityQuery.from('Tiebreakers').where('settings_pk', '==', this.settings.pk).orderBy('order_index');
            _.each(mgr.executeQueryLocally(tiebreakers_q), function(tbkr, idx) {
                tiebreakers.push(tbkr.name);
            });
            return ppnts.sort(function(a, b) {
                var val = 0;
                _.each(tiebreakers, function(func_name, idx, lst) {
                    var func = utils.tiebreakers[func_name].func;
                    if (reverse) {
                        val = val || func(b, a);
                    } else {
                        val = val || func(a, b);
                    }
                });
                return val;
            });
        };
        Tournament.prototype.sort_by_tiebreaker = function(ppnts, tiebreaker, reverse) {
            if (_.isUndefined(reverse)) {
                reverse = false;
            }
            var func = utils.tiebreakers[tiebreaker].func;
            return ppnts.sort(function(a, b) {
                var val = 0;
                if (reverse) {
                    val = func(b, a);
                } else {
                    val = func(a, b);
                }
                return val;
            });
        };
        Tournament.prototype.sort_by_seat = function(ppnts) {
            return _.sortBy(ppnts, "pod_seat");
        };
        Tournament.prototype.sorted_ppnts = function(reverse) {
            if (_.isUndefined(reverse)) {
                reverse = true;
            }
            return this.sort(this.participants, reverse);
        };
        Tournament.prototype.sorted_active_ppnts = function(reverse) {
            if (_.isUndefined(reverse)) {
                reverse = true;
            }
            return this.sort(this.get_active_ppnts(), reverse);
        };
        Tournament.prototype.get_active_ppnts = function(order_by, active) {
            active = !utils.is_null_or_undefined(active) ? active : true;
            var active_q = breeze.EntityQuery.from('Participants').where('is_active', '==', active).where('tournament_pk', '==', this.pk);
            if (!utils.is_null_or_undefined(order_by)) {
                active_q = active_q.orderBy(order_by);
            }
            return this.entityAspect.entityManager.executeQueryLocally(active_q);
        };
        Tournament.prototype.count_pods = function() {
            var num_of_pods = _.size(_.countBy(this.participants, "pod"));
            return num_of_pods;
        };
        Tournament.prototype.factions_entered = function() {
            var found = false
            var result = _.find(this.participants, function(participant) {
                return (participant.faction != '' || participant.faction2 != '');
            });
            return !_.isUndefined(result);
        };
        Tournament.prototype.get_role_names = function() {
            return _.keys(this.settings.factions);
        };
        Tournament.prototype.uses_margin_of_victory = function() {
            if (!utils.is_null_or_undefined(this._cache.uses_margin_of_victory)) {
                return this._cache.uses_margin_of_victory;
            }
            var q = breeze.EntityQuery.from('Tiebreakers').where('name', '==', 'margin_of_victory').where('settings_pk', '==', this.settings.pk);
            var uses_mov = _.size(this.entityAspect.entityManager.executeQueryLocally(q));
            this._cache.uses_margin_of_victory = uses_mov;
            return uses_mov
        };
        Tournament.prototype.clear_cache = function() {
            this._cache = {};
        };
        Tournament.prototype.clear_caches = function() {
            this.clear_cache();
            _.each(this.participants, function(ppnt, idx) {
                ppnt.clear_cache();
            });
        };
        Tournament.prototype.uses_roles = function() {
            if (!utils.is_null_or_undefined(this._cache.uses_roles)) {
                return this._cache.uses_roles;
            }
            var uses_roles = this.settings.number_of_roles > 1;
            uses_roles &= this.format.name == 'Double Elimination';
            this._cache.uses_roles = uses_roles;
            return uses_roles;
        };
    };
    models.TournamentInitializer = function TournamentInitializer(tnmt) {
        tnmt._cache = {};
        tnmt.format = formats[tnmt.format_pk];
    };
    models.Participant = function Participant() {
        Participant.prototype.clone = function() {
            var self = this;
            return {
                first_name: self.first_name,
                last_name: self.last_name,
                email: self.email,
                phone_number: self.phone_number,
                is_active: self.is_active,
                ffg_id: self.ffg_id,
                swiss_id: self.swiss_id,
                reward_byes: self.reward_byes,
                has_received_bye: self.has_received_bye,
                seed: self.seed,
                pod: self.pod,
                tournament_pk: self.tournament_pk,
                base_points: self.base_points,
                base_margin_of_victory: self.base_margin_of_victory
            };
        };
        Participant.prototype.full_name = function() {
            return this.first_name + " " + this.last_name;
        };
        Participant.prototype.total_points = function(tnmt) {
            if (!utils.is_null_or_undefined(this._cache.total_points)) {
                return this._cache.total_points;
            }
            var total = this.base_points;
            if (utils.is_null_or_undefined(tnmt)) {
                tnmt = this.tournament;
            }
            _.each(this.matchparticipants, function(ppnt, idx, lst) {
                if (ppnt.match.tournament == tnmt) {
                    total += ppnt.points_earned;
                }
            }, this);
            this._cache.total_points = total;
            return total;
        };
        Participant.prototype.get_place = function() {
            if (!utils.is_null_or_undefined(this._cache.place)) {
                return this._cache.place;
            }
            var tnmt = this.tournament;
            var place = _.indexOf(tnmt.sorted_ppnts(), this) + 1;
            this._cache.place = place;
            return place;
        };
        Participant.prototype.get_elimination_place = function() {
            if (!utils.is_null_or_undefined(this._cache.elim_place)) {
                return this._cache.elim_place;
            }
            var tnmt = this.tournament;
            var ppnts = tnmt.get_active_ppnts();
            var grouped_ppnts = _.groupBy(ppnts, function(ppnt) {
                return ppnt.count_past_losses(tnmt.current_round);
            });
            var sorted_groups = [];
            _.each(grouped_ppnts, function(ppnt_array) {
                ppnt_array = tnmt.sort(ppnt_array, true);
                sorted_groups = sorted_groups.concat(ppnt_array);
            });
            _.each(sorted_groups, function(ppnt, idx) {
                ppnt._cache.elim_place = idx + 1;
            });
            return this._cache.elim_place;
        };
        Participant.prototype.opponents = function() {
            var tnmt = this.tournament;
            var opponents = [];
            var match_ppnts = _.sortBy(this.matchparticipants, function(itm) {
                return itm.match.round;
            });
            _.each(match_ppnts, function(ppnt, idx, lst) {
                _.each(ppnt.match.matchparticipants, function(opp, idx) {
                    if (ppnt.match.tournament == tnmt && opp != ppnt && !_.isNull(opp.participant)) {
                        opponents.push(opp.participant);
                    }
                });
            });
            return opponents;
        };
        Participant.prototype.all_opponents = function() {
            var ppnt = this;
            var opponents = [];
            do {
                var tnmt = ppnt.tournament;
                var match_ppnts = _.sortBy(ppnt.matchparticipants, function(itm) {
                    return itm.match.round;
                });
                _.each(match_ppnts, function(ppnt, idx, lst) {
                    _.each(ppnt.match.matchparticipants, function(opp, idx) {
                        if (ppnt.match.tournament == tnmt && opp != ppnt && !_.isNull(opp.participant)) {
                            opponents.push(opp.participant);
                        }
                    });
                });
                ppnt = ppnt.parent;
            } while (!_.isNull(ppnt));
            return opponents;
        };
        Participant.prototype.get_matches = function() {
            var matches = [];
            _.each(this.matchparticipants, function(mppnt, idx, lst) {
                matches.push(mppnt.match);
            });
            return _.sortBy(matches, 'round');
        };
        Participant.prototype.has_match = function(round) {
            if (utils.is_null_or_undefined(round)) {
                round = this.tournament.current_round;
            }
            return _.find(this.matchparticipants, function(mp, idx) {
                return mp.match.round == round && mp.match.tournament == this.tournament;
            }, this);
        };
        Participant.prototype.rounds_played = function(tnmt) {
            if (utils.is_null_or_undefined(tnmt)) {
                tnmt = this.tournament;
            }
            var mppnts = _.filter(this.matchparticipants, function(mp) {
                return mp.match.tournament == tnmt;
            });
            return _.size(mppnts) + this.base_rounds_played;
        };
        Participant.prototype.str_of_sched = function(tnmt) {
            if (!utils.is_null_or_undefined(this._cache.str_of_sched)) {
                return this._cache.str_of_sched;
            }
            if (utils.is_null_or_undefined(tnmt)) {
                tnmt = this.tournament;
            }
            var total = 0;
            var opponents = this.all_opponents(tnmt);
            _.each(opponents, function(opp, idx, lst) {
                total += (opp.total_points() / opp.rounds_played());
            }, this);
            total /= _.size(opponents);
            if (_.isNaN(total)) {
                total = 0;
            }
            this._cache.str_of_sched = total;
            return total;
        };
        Participant.prototype.ext_str_of_sched = function(tnmt) {
            if (!utils.is_null_or_undefined(this._cache.ext_str_of_sched)) {
                return this._cache.ext_str_of_sched;
            }
            if (utils.is_null_or_undefined(tnmt)) {
                tnmt = this.tournament;
            }
            var total = 0;
            var opponents = this.all_opponents(tnmt);
            _.each(opponents, function(opp, idx, lst) {
                total += opp.str_of_sched();
            }, this);
            total /= _.size(opponents);
            if (_.isNaN(total)) {
                total = 0;
            }
            this._cache.ext_str_of_sched = total;
            return total;
        };
        Participant.prototype.margin_of_victory = function(tnmt) {
            if (!utils.is_null_or_undefined(this._cache.margin_of_victory)) {
                return this._cache.margin_of_victory;
            }
            var mov = this.base_margin_of_victory;
            if (utils.is_null_or_undefined(tnmt)) {
                tnmt = this.tournament;
            }
            _.each(this.matchparticipants, function(mppnt, idx) {
                if (mppnt.match.tournament == tnmt) {
                    mov += mppnt.margin_of_victory;
                }
            });
            this._cache.margin_of_victory = mov;
            return mov;
        };
        Participant.prototype.has_played = function(ppnt, limit_to_round) {
            if (utils.is_null_or_undefined(limit_to_round)) {
                limit_to_round = false;
            }
            return _.find(this.matchparticipants, function(mppnt, idx) {
                if (limit_to_round !== false && mppnt.match.round > limit_to_round) {
                    return false;
                }
                return mppnt.match.has_participant(ppnt) && mppnt.match.tournament == this.tournament;
            }, this);
        };
        Participant.prototype.points_earned_from = function(ppnt) {
            var points = 0;
            _.find(this.matchparticipants, function(mppnt, idx) {
                if (!_.isNull(mppnt.match)) {
                    if (mppnt.match.has_participant(ppnt) && mppnt.match.tournament == this.tournament) {
                        points += mppnt.points_earned;
                    }
                }
            }, this);
            return points;
        };
        Participant.prototype.get_losses = function() {
            var losses = [];
            _.each(this.get_matches(), function(match) {
                var winner = match.matchparticipants[0];
                _.each(match.matchparticipants, function(mppnt) {
                    if (winner.points_earned <= mppnt.points_earned) {
                        winner = mppnt;
                    }
                });
                if (winner.participant != this) {
                    losses.push(match);
                }
            }, this);
            return losses;
        };
        Participant.prototype.count_losses = function() {
            return _.size(this.get_losses());
        };
        Participant.prototype.count_past_losses = function(round) {
            return _.size(_.filter(this.get_losses(), function(match) {
                return match.round != round
            }));
        };
        Participant.prototype.has_lost = function() {
            return 1 <= this.count_losses();
        };
        Participant.prototype.most_recent_loss = function() {
            var losses = this.get_losses();
            if (_.size(losses) > 0) {
                return _.last(_.sortBy(losses, 'round'))
            }
            return null;
        };
        Participant.prototype.get_scorecard_href = function() {
            return "#/participant/" + (-1 * this.pk);
        };
        Participant.prototype.get_scorecard_link = function() {
            var a = "<a href='" + this.get_scorecard_href() + "' target='_blank' tabindex='-1'>";
            a += this.first_name + " " + this.last_name + "</a>";
            return a;
        };
        Participant.prototype.is_empty = function() {
            return !this.first_name;
        };
        Participant.prototype.clear_cache = function() {
            this._cache = {};
        };
    };
    models.ParticipantInitializer = function ParticipantInitializer(ppnt) {
        ppnt._cache = {};
        if (utils.is_null_or_undefined(ppnt.tiebreaker)) {
            ppnt.tiebreaker = Math.random();
        }
    };
    models.Match = function Match() {
        Match.prototype.delete = function() {
            var this_match = this;
            var these_matchparticipants = [];
            for (var i = 0; i < this_match.matchparticipants.length; i++) {
                these_matchparticipants.push(this_match.matchparticipants[i])
            }
            _.each(these_matchparticipants, function(mp, idx) {
                try {
                    if (mp.match == this_match) {
                        mp.entityAspect.setDeleted();
                    }
                } catch (e) {}
            });
            this_match.entityAspect.setDeleted();
        };
        Match.prototype.has_scores = function() {
            return _.every(this.matchparticipants, function(ppnt, idx) {
                return !_.isNull(ppnt.points_earned);
            });
        };
        Match.prototype.has_any_score = function() {
            return _.any(this.matchparticipants, function(ppnt, idx) {
                return !_.isNull(ppnt.points_earned);
            });
        };
        Match.prototype.format_scores = function() {
            var str = "";
            var uses_mov = this.tournament.uses_margin_of_victory();
            if (_.size(this.matchparticipants) == 1) {
                str += this.matchparticipants[0].points_earned;
                if (uses_mov) {
                    str += " (" + this.matchparticipants[0].margin_of_victory + ")";
                }
                str += " &ndash; 0";
                if (uses_mov) {
                    str += " (0)";
                }
                return str;
            }
            _.each(this.matchparticipants, function(ppnt, idx, lst) {
                str += ppnt.points_earned;
                if (uses_mov) {
                    str += " (" + ppnt.margin_of_victory + ")";
                }
                if (idx != _.size(lst) - 1) {
                    str += " &ndash; ";
                }
            });
            return str;
        };
        Match.prototype.has_participant = function(ppnt) {
            return _.find(this.matchparticipants, function(mp) {
                return mp.participant == ppnt;
            });
        };
        Match.prototype.is_bye = function() {
            return _.size(this.matchparticipants) == 1;
        };
        Match.prototype.assign_roles = function() {
            var round = this.tournament.current_round;
            var settings = this.tournament.settings;
            var format = this.tournament.format;
            var mppnts = this.matchparticipants;
            if (format.name != 'Double Elimination' || round < 2 || settings.number_of_roles < 2 || _.size(mppnts) != 2) {
                return;
            }
            var mppnt0_data = mppnts[0].get_least_played_role_data();
            var mppnt1_data = mppnts[1].get_least_played_role_data();
            if (mppnt0_data.least_played != mppnt1_data.least_played) {
                mppnts[0].role = mppnt0_data.least_played;
                mppnts[1].role = mppnt1_data.least_played;
            } else if (mppnt0_data.differential != mppnt1_data.differential) {
                var available_roles = _.range(1, 1 + settings.number_of_roles);
                if (mppnt0_data.differential < mppnt1_data.differential) {
                    mppnts[1].role = mppnt1_data.least_played;
                    mppnts[0].role = _.sample(_.without(available_roles, mppnts[1].role));
                } else {
                    mppnts[0].role = mppnt0_data.least_played;
                    mppnts[1].role = _.sample(_.without(available_roles, mppnts[0].role));
                }
            } else {
                var roles = _.sample(_.range(1, 1 + settings.number_of_roles), 2);
                _.each(mppnts, function(mppnt, idx) {
                    mppnt.role = roles[idx];
                });
            }
        };
        Match.prototype.is_rematch = function(current_round) {
            var i, j;
            for (i = 0; i < _.size(this.matchparticipants); i += 1) {
                for (j = i + 1; j < _.size(this.matchparticipants); j += 1) {
                    var pyr1 = this.matchparticipants[i].participant;
                    var pyr2 = this.matchparticipants[j].participant;
                    if (pyr1.has_played(pyr2, current_round)) {
                        return true;
                    }
                }
            }
            return false;
        };
    };
    models.MatchParticipant = function MatchParticipant() {
        MatchParticipant.prototype.get_least_played_role_data = function() {
            var counts = {};
            _.each(_.range(1, 1 + this.match.tournament.settings.number_of_roles), function(num) {
                if (num) {
                    counts[num] = 0;
                }
            });
            _.each(this.participant.matchparticipants, function(mppnt) {
                if (mppnt.role) {
                    counts[mppnt.role] += 1;
                }
            });
            var max = _.max(counts);
            var min = _.min(counts);
            return {
                least_played: _.findKey(counts, function(val) {
                    return val == min;
                }),
                differential: max - min
            };
        };
        MatchParticipant.prototype.get_opponents = function() {
            var self = this;
            var opponents = [];
            _.each(this.match.matchparticipants, function(mppnt, idx) {
                if (mppnt != self) {
                    opponents.push(mppnt);
                }
            });
            return opponents;
        };
        MatchParticipant.prototype.get_role_name = function(tnmt) {
            var self = this;
            var role_names = _.keys(tnmt.settings.factions);
            return role_names[self.role - 1];
        }
    };
    models.Settings = function Settings() {
        Settings.prototype.clone = function() {
            var self = this;
            return {
                name: self.name,
                number_of_roles: self.number_of_roles,
                original_name: self.original_name,
                min_players: self.min_players,
                max_players: self.max_players,
                win_points: self.win_points,
                win_mov: self.win_mov,
                draw_points: self.draw_points,
                bye_points: self.bye_points,
                bye_mov: self.bye_mov,
                pod_size: self.pod_size,
                bye_strategy: self.bye_strategy,
                resolution_strategy: self.resolution_strategy,
                logo: self.logo,
                uses_factions: self.uses_factions
            };
        };
        Settings.prototype.score_callback = function(match) {
            var self = this;
            try {
                return score_callbacks[self.name](match);
            } catch (e) {
                return score_callbacks['default'](match);
            }
        };
    };
    models.SettingsInitializer = function SettingsInitializer(settings) {
        _.extend(settings, game_overrides['default']);
        _.extend(settings, game_overrides[settings.original_name]);
    };
    models.Tiebreaker = function Tiebreaker() {
        Tiebreaker.prototype.clone = function() {
            var self = this;
            return {
                name: self.name,
                pretty_name: self.pretty_name,
                order_index: self.order_index,
                settings_pk: self.settings_pk
            };
        };
    };
    return models;
}());

//models.js ^^

DEBUG = settings.debug;
var utils = (function() {
    var utils = Object();
    utils.debug = function(msg) {
        if (DEBUG) {
            console.log(msg);
        }
    };
    utils.show_modal = function(id) {
        $('#overlay-background').show();
        $(id).show();
    };
    utils.hide_modal = function(id) {
        $('#overlay-background').hide();
        $(id).hide();
    };
    utils.show_error = function(msg, title) {
        if (utils.is_null_or_undefined(title)) {
            title = "Error";
        }
        var err_div = $('#error');
        err_div.find('.title').html(title);
        err_div.find('.content').html(msg);
        utils.show_modal('#error');
    };
    utils.is_null_or_undefined = function(thing) {
        return _.isNull(thing) || _.isUndefined(thing);
    };
    utils.lgthm = function(num, base) {
        return Math.log(num) / Math.log(base ? base : 2);
    };
    utils.is_integer = function(value) {
        return /^\-?\d+$/.test(value);
    };
    utils.create_loss = function(tnmt, player, _, __, order_index) {
        if (utils.is_null_or_undefined(order_index)) {
            order_index = 20000;
        }
        return utils.create_match(tnmt, player, 0, 0, order_index);
    };
    utils.create_bye = function(tnmt, player, points, margin, order_index) {
        if (utils.is_null_or_undefined(points)) {
            points = tnmt.settings.bye_points;
        }
        if (utils.is_null_or_undefined(margin)) {
            margin = tnmt.settings.bye_mov;
        }
        player.has_received_bye = true;
        return utils.create_match(tnmt, player, points, margin, order_index);
    };
    utils.create_reward_bye = function(tnmt, player, points, margin, order_index) {
        if (utils.is_null_or_undefined(points)) {
            points = tnmt.settings.bye_points;
        }
        if (utils.is_null_or_undefined(margin)) {
            margin = tnmt.settings.bye_mov;
        }
        player.has_received_bye = true;
        return utils.create_match(tnmt, player, points, margin, order_index)
    };
    utils.create_match = function(tnmt, players, points, margin, order_index) {
        if (utils.is_null_or_undefined(points)) {
            points = null;
        }
        if (utils.is_null_or_undefined(margin)) {
            margin = null;
        }
        if (players && players.constructor !== Array) {
            players = [players];
        }
        if (_.size(players) == 1) {
            players[0].has_received_bye = true;
            order_index = -1;
        }
        var increment_amount = 0;
        if (utils.is_null_or_undefined(order_index)) {
            increment_amount = 1;
            order_index = tnmt.match_counter || 0;
        }
        var mgr = tnmt.entityAspect.entityManager;
        var match = mgr.createEntity('Match', {
            tournament: tnmt,
            order_index: order_index,
            round: tnmt.current_round
        });
        utils.debug('Creating table ' + (order_index + 1));
        _.each(players, function(pyr, idx) {
            if (!utils.is_null_or_undefined(pyr)) {
                mgr.createEntity('MatchParticipant', {
                    match: match,
                    participant: pyr,
                    points_earned: points,
                    margin_of_victory: margin,
                    table_seat: idx
                })
            }
        });
        match.assign_roles();
        tnmt.match_counter += increment_amount;
        return match;
    };
    utils._make_byes = function(tnmt, ppnts, number) {
        var recipients = [],
            idx = 0;
        while (_.size(recipients) < number && idx < _.size(ppnts)) {
            var num_of_byes_maxed = (utils.no_of_byes_in_list(ppnts) == _.size(ppnts));
            var not_first_round = ((_.size(ppnts[idx].opponents()) > 0 && tnmt.current_round > 1) || tnmt.current_round <= 1);
            if ((!ppnts[idx].has_received_bye || num_of_byes_maxed) && not_first_round) {
                utils.debug("Granting bye to " + ppnts[idx].first_name);
                utils.create_bye(tnmt, ppnts[idx], null, null, 10000);
                recipients.push(ppnts[idx]);
            }
            idx += 1;
        }
        var msg = "failed to make " + number + " byes!";
        console.assert(_.size(recipients) == number, msg);
        return _.difference(ppnts, recipients);
    };
    utils.bye_strategies = {
        lowest: function(tnmt, ppnts, number) {
            return utils._make_byes(tnmt, tnmt.sort(ppnts), number)
        },
        highest: function(tnmt, ppnts, number) {
            return utils._make_byes(tnmt, tnmt.sort(ppnts, true), number);
        },
        random: function(tnmt, ppnts, number) {
            return utils._make_byes(tnmt, _.shuffle(ppnts), number);
        }
    };
    utils.no_of_byes_in_list = function(ppnts) {
        return _.countBy(ppnts, 'has_received_bye')['true'];
    }
    utils.tiebreakers = {
        score: {
            name: "score",
            pretty_name: "Score",
            order_index: 1,
            func: function(a, b) {
                return a.total_points() - b.total_points();
            }
        },
        head_to_head: {
            name: "head_to_head",
            pretty_name: "Head to Head",
            order_index: 2,
            func: function(a, b) {
                return a.points_earned_from(b) - b.points_earned_from(a);
            }
        },
        str_of_sched: {
            name: "str_of_sched",
            pretty_name: "Strength of Schedule",
            order_index: 3,
            func: function(a, b) {
                return a.str_of_sched() - b.str_of_sched();
            }
        },
        ext_str_of_sched: {
            name: "ext_str_of_sched",
            pretty_name: "Extended Strength of Schedule",
            order_index: 4,
            func: function(a, b) {
                return a.ext_str_of_sched() - b.ext_str_of_sched();
            }
        },
        margin_of_victory: {
            name: "margin_of_victory",
            pretty_name: "Margin of Victory",
            order_index: 5,
            func: function(a, b) {
                return a.margin_of_victory() - b.margin_of_victory();
            }
        },
        random: {
            name: 'random',
            pretty_name: 'Random',
            order_index: 6,
            func: function(a, b) {
                return a.tiebreaker - b.tiebreaker;
            }
        },
        seed: {
            name: 'seed',
            pretty_name: 'Seed',
            order_index: 7,
            func: function(a, b) {
                return parseInt(b.seed) - parseInt(a.seed);
            }
        }
    };
    utils.make_score_group = function(tnmt, ppnts) {
        ppnts = tnmt.sort(ppnts, true);
        var first_score = ppnts[0].total_points(),
            score_group = [];
        while (0 < _.size(ppnts)) {
            if (ppnts[0].total_points() != first_score) {
                break;
            }
            score_group.push(ppnts.shift());
        }
        return score_group;
    };
    utils.create_brackets = function(ppnts, max_players) {
        var i, j, k, idx;
        var forwards = true;
        var list, sub_lists;
        var iterations = utils.lgthm(_.size(ppnts), max_players);
        list = [ppnts];
        while (_.size(list[0]) > 1) {
            var new_list = [];
            for (i = 0; i < _.size(list); i += 1) {
                sub_lists = [];
                for (j = 0; j < max_players; j += 1) {
                    sub_lists.push([]);
                }
                while (_.size(list[i]) > 0) {
                    for (k = 0; k < max_players; k += 1) {
                        idx = k;
                        if (!forwards) {
                            idx = (max_players - 1) - k;
                        }
                        sub_lists[idx].push(list[i].shift());
                    }
                    forwards = !forwards;
                }
                new_list = new_list.concat(sub_lists);
            }
            list = new_list;
        }
        return _.flatten(list);
    };
    utils.assign_pods = function(tnmt) {
        var sort_func = function(ppnts) {
            return _.shuffle(ppnts)
        };
        console.log(!_.isNull(tnmt.parent_pk));
        console.log(tnmt.current_round);
        if (!_.isNull(tnmt.parent_pk) && tnmt.current_round == 0) {
            sort_func = function(ppnts) {
                return tnmt.sort(ppnts, true)
            };
        }
        var mgr = tnmt.entityAspect.entityManager;
        var pyrs = sort_func(tnmt.participants);
        var pods = [],
            pod;
        while (_.size(pyrs) > tnmt.settings.pod_size * 2) {
            pods.push(_.first(pyrs, tnmt.settings.pod_size));
            pyrs = _.rest(pyrs, tnmt.settings.pod_size);
        }
        if (_.size(pyrs) <= tnmt.settings.pod_size) {
            pods.push(pyrs);
        } else {
            pod = _.first(pyrs, Math.floor(_.size(pyrs) / 2.0));
            pyrs = _.rest(pyrs, _.size(pod));
            switch (_.size(pod) % 2 + _.size(pyrs) % 2) {
                case 0:
                    break;
                case 1:
                    break;
                case 2:
                    pod.push(pyrs.shift());
                    break;
            }
            pods.push(pod);
            pods.push(pyrs);
        }
        var i, j;
        for (i = 0; i < _.size(pods); i += 1) {
            pods[i] = sort_func(pods[i]);
            for (j = 0; j < _.size(pods[i]); j += 1) {
                pods[i][j].pod_seat = j;
                pods[i][j].pod = i;
            }
        }
        mgr.acceptChanges();
        return pods;
    };
    utils.get_by_pods = function(tnmt, active) {
        var pods = [],
            ppnts, i;
        if (active) {
            ppnts = tnmt.get_active_ppnts();
        } else {
            ppnts = tnmt.participants;
        }
        console.log(ppnts);
        for (i = 0; i < tnmt.count_pods(); i += 1) {
            pods.push([]);
        }
        for (i = 0; i < _.size(ppnts); i += 1) {
            pods[ppnts[i].pod].push(ppnts[i]);
        }
        for (i = 0; i < _.size(pods); i += 1) {
            pods[i] = (tnmt.sort_by_seat(pods[i]));
        }
        return pods;
    };
    utils.build_tables = function(tnmt, ppnts) {
        var tables = [],
            idx = undefined;
        while (tnmt.settings.max_players <= _.size(ppnts)) {
            pyrs = _.first(ppnts, tnmt.settings.max_players);
            ppnts = _.rest(ppnts, tnmt.settings.max_players);
            tables.push(pyrs);
        }
        while (tnmt.settings.min_players <= _.size(ppnts)) {
            pyrs = _.first(ppnts, tnmt.settings.min_players);
            ppnts = _.rest(ppnts, tnmt.settings.min_players);
            tables.push(pyrs);
        }
        if (tnmt.settings.resolution_strategy == 'small_matches') {
            if (_.size(ppnts)) {
                tables.push(ppnts);
            }
            idx = _.size(tables) - 1;
            while (idx > 0) {
                while (_.size(tables[idx]) < tnmt.settings.min_players) {
                    tables[idx].unshift(tables[idx - 1].pop());
                }
                idx -= 1;
            }
        }
        idx = _.size(tables) - 1;
        while (idx > 0) {
            while (_.size(tables[idx]) < tnmt.settings.min_players) {
                tables[idx].unshift(tables[idx - 1].pop());
            }
            idx -= 1;
        }
        return tables;
    };
    utils.double_elim_reverse_helper = function(list) {
        var list_size = _.size(list);
        if (list_size < 2) {
            return list;
        } else if (list_size == 2) {
            list.reverse();
            return list;
        }
        var a = utils.double_elim_reverse_helper(_.first(list, list_size / 2));
        var b = utils.double_elim_reverse_helper(_.last(list, list_size / 2));
        var c = a.concat(b);
        c.reverse();
        return c;
    };
    utils.compute_cost_matrix = function(workers, tasks) {
        var REMATCH_CONSTANT = 1000;
        var GROUP_CONSTANT = 10;
        var M = [];
        var x, y;
        for (x = 0; x < _.size(workers); x += 1) {
            var worker = workers[x];
            M.push([]);
            for (y = 0; y < _.size(tasks); y += 1) {
                var task = tasks[y];
                var group_diff = Math.abs(worker.score_group - task.score_group);
                M[x][y] = worker.has_played(task) ? REMATCH_CONSTANT : GROUP_CONSTANT * group_diff;
                M[x][y] = Math.pow(M[x][y], 2);
            }
        }
        return M;
    };
    utils.apply_hungarian_algorithm = function(tnmt, ppnts, cost_fn) {
        if (utils.is_null_or_undefined(cost_fn)) {
            cost_fn = utils.compute_cost_matrix;
        }
        var score_groups = [];
        while (_.size(ppnts)) {
            score_groups.push(utils.make_score_group(tnmt, ppnts));
        }
        utils.debug("\nScore groups: ");
        utils.debug(score_groups);
        var A = [],
            B = [];
        _.each(score_groups, function(group, idx) {
            var selectees, remainder;
            _.each(group, function(pyr) {
                pyr.score_group = idx;
            });
            selectees = _.sample(group, _.size(group) / 2);
            remainder = _.difference(group, selectees);
            if (_.size(B) > _.size(A)) {
                B = B.concat(selectees);
                A = A.concat(remainder);
            } else {
                A = A.concat(selectees);
                B = B.concat(remainder);
            }
        });
        console.assert(_.size(A) == _.size(B), "A and B are not the same size!");
        utils.debug("\nA: ");
        utils.debug(A);
        utils.debug("\nB: ");
        utils.debug(B);
        var M = cost_fn(A, B);
        _.each(M, function(row, idx) {
            utils.debug(row.toString());
        });
        var matches = hungarian.pair(M);
        var ppnt_matches = [];
        _.each(matches, function(match, idx) {
            ppnt_matches.push([A[match[0]], B[match[1]]]);
        });
        return ppnt_matches;
    };
    utils.match_sort = function(tnmt, matches) {
        var match_list = [];
        _.each(matches, function(table, idx) {
            var match = tnmt.sort(table, true);
            match_list.push(match);
        });
        var first_ppnt_list = [];
        _.each(match_list, function(match) {
            first_ppnt_list.push(match[0]);
        });
        first_ppnt_list = tnmt.sort(first_ppnt_list, true);
        var sorted_match_list = [];
        _.each(first_ppnt_list, function(ppnt, idx) {
            sorted_match_list.push(_.find(match_list, function(match) {
                return ppnt == match[0];
            }));
        });
        for (var j = 0; j < _.size(sorted_match_list) - 1; j++) {
            var equal_first_players = (sorted_match_list[j][0].total_points() == sorted_match_list[j + 1][0].total_points());
            var misranked_second_players = (sorted_match_list[j][1].total_points() < sorted_match_list[j + 1][1].total_points());
            if (equal_first_players && misranked_second_players) {
                var temp_match = sorted_match_list[j];
                sorted_match_list[j] = sorted_match_list[j + 1];
                sorted_match_list[j + 1] = temp_match;
                j = 0;
            }
        }
        return sorted_match_list;
    };
    return utils;
}());

//utils.js ^^