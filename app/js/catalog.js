const $ = require("jquery");
const fs = require("fs");
const Handlebars = require("handlebars");
const Tablesorter = require("tablesorter");
const Tags = require("./util/taghelper");
const Helpers = require('./util/handlebar-helpers');
//data
const manufacturers = require("../resources/data/manufacturers.json");
const core_bonuses = require("../resources/data/core_bonus.json");
const pilot_gear = require("../resources/data/pilot_gear.json");
pilot_gear.weapons = Tags.expand(pilot_gear.weapons);
const shells = require("../resources/data/shells.json");
const weapons = Tags.expand(require("../resources/data/weapons.json"));
const mods = require("../resources/data/mods.json");
const systems = Tags.expand(require("../resources/data/systems.json"));
//templates
const manufacturerTemplate = fs.readFileSync(__dirname + "/templates/catalog/manufacturers.hbs", "utf8");
const pilotArmorTemplate = fs.readFileSync(__dirname + "/templates/catalog/pilot-armor.hbs", "utf8");
const pilotWeaponTemplate = fs.readFileSync(__dirname + "/templates/catalog/pilot-weapons.hbs", "utf8");
const pilotGearTemplate = fs.readFileSync(__dirname + "/templates/catalog/pilot-gear.hbs", "utf8");
const bonusTemplate = fs.readFileSync(__dirname + "/templates/catalog/core-bonuses.hbs", "utf8");
const shellTemplate = fs.readFileSync(__dirname + "/templates/catalog/shells.hbs", "utf8");
const weaponTemplate = fs.readFileSync(__dirname + "/templates/catalog/weapons.hbs", "utf8");
const modTemplate = fs.readFileSync(__dirname + "/templates/catalog/mods.hbs", "utf8");
const systemTemplate = fs.readFileSync(__dirname + "/templates/catalog/systems.hbs", "utf8");

var template;
var itemObj = {};

Helpers.init();

var template = Handlebars.compile(manufacturerTemplate);
$("#manufacturer-sidebar").html(template({"manufacturers": manufacturers}));

$(".manu-block").click(function(e){
  $(this).toggleClass('selected');
})

//type selector
$("#type-dropdown").change(function() {
  var val = $(this).val();

  $(".subtype-dropdown").each(function(){$(this).hide(300)});

  switch (val) {
    case "pilot_gear":
      $("#subtype-pg-dropdown").show(300);
      break;
    case "core_bonuses":
      var template = Handlebars.compile(bonusTemplate);
      itemObj.items = core_bonuses;
      break;
    case "shells":
      var template = Handlebars.compile(shellTemplate);
      itemObj.items = shells;
      break;
    case "weapons":
      var template = Handlebars.compile(weaponTemplate);
      itemObj.items = weapons;
      break;
    case "mods":
      var template = Handlebars.compile(modTemplate);
      itemObj.items = mods;
      break;      
    case "systems":
      var template = Handlebars.compile(systemTemplate);
      itemObj.items = systems;
      break;
    default:
      break;
  }

  $("#scroll-body").html(template(itemObj));
  tableInit()
})

//pilot gear type selector
$("#subtype-pg-dropdown").change(function () {
  var val = $(this).val();

  switch (val) {
    case "armor":
      template = Handlebars.compile(pilotArmorTemplate)
      itemObj.items = pilot_gear.armor;
      break;
    case "weapons":
      template = Handlebars.compile(pilotWeaponTemplate);
      itemObj.items = pilot_gear.weapons;
      break;
    case "gear":
      template = Handlebars.compile(pilotGearTemplate);
      itemObj.items = pilot_gear.gear;
      break;
    default:
      break;
  }

  $("#scroll-body").html(template(itemObj));
  tableInit()
})

//select/unselect all
$("#select-all").click(function() {
  $(".manu-block").each(function(){
    $(this).addClass('selected')
  })
  filterBySource();
})

$("#select-none").click(function () {
  $(".manu-block").each(function () {
    $(this).removeClass('selected')
  })
  filterBySource();
})

$(".manu-block").click(function() {
  filterBySource();
});

// $(".reset").click(filterBySource);

function filterBySource(clearSearch) {
  if (!itemObj.items) return;
  $("#catalog-search").val('');
  $('.tablesorter-childRow td').hide();

  var activeIDs = [];
  $(".manu-block").each(function () {
    var m = $(this);
    if (m.hasClass("selected")) {
      activeIDs.push(m.data("filter-text"))
    }
  })

  $(".catalog-item").each(function () {
    var i = $(this);
    if (activeIDs.indexOf(i.data("source")) == -1) {
      i.addClass('filtered');
    } else {
      i.removeClass('filtered');
    }
  })
  $(".tablesorter").tablesorter().trigger('search', false);
}

// Manufacturer info modal button
$(".manu-modal-btn").click(function (e) {
  let modalID = $(this).data("modal");
  $('#' + modalID).css("display", "block");
  $('.modal-body').html($(this).data("description"));
});

$('.close').click(function () {
  let modalID = $(this).data("modal");
  $('#' + modalID).css("display", "none");
});


function tableInit() {
  $('.tablesorter-childRow td').hide();
  $(".tablesorter").tablesorter({
    cssChildRow: "tablesorter-childRow",
      widgets: ["filter"],
      widgetOptions: {
        filter_external: $('#catalog-search'),
        filter_defaultFilter: {},
        filter_columnFilters: false,
        filter_childRows: false,
        filter_placeholder: {
          search: 'Search...'
        },
        filter_saveFilters: false,
        filter_cssFilter: 'tablesorter-filter',
        filter_startsWith: false,
        filter_ignoreCase: true,
        filter_liveSearch: true
      }
  })
 
  $('.tablesorter').delegate('.toggle', 'click', function () {
    $(this).closest('tr').toggleClass('catalog-open')
    $(this).closest('tr').nextUntil('tr.tablesorter-hasChildRow').find('td').toggle();
    return false;
  });

  // after search filtering is complete, run filterbysource
  $('.tablesorter').bind('filterEnd', function (event, config) {
    var activeIDs = [];
    $(".manu-block").each(function () {
      var m = $(this);
      if (m.hasClass("selected")) {
        activeIDs.push(m.data("filter-text"))
      }
    })

    $(".catalog-item").each(function () {
      var i = $(this);
      if (activeIDs.indexOf(i.data("source")) == -1) {
        i.addClass('filtered');
      }
    })
  });

  //on reset, clear filter _but then_ run filterbysource
  $('.reset').click(function () {
    $('.tablesorter').trigger('filterReset');
    filterBySource();
    return false;
  });

}