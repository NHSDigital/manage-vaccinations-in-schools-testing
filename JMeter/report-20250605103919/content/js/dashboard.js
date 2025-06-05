/*
   Licensed to the Apache Software Foundation (ASF) under one or more
   contributor license agreements.  See the NOTICE file distributed with
   this work for additional information regarding copyright ownership.
   The ASF licenses this file to You under the Apache License, Version 2.0
   (the "License"); you may not use this file except in compliance with
   the License.  You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/
var showControllersOnly = false;
var seriesFilter = "";
var filtersOnlySampleSeries = true;

/*
 * Add header in statistics table to group metrics by category
 * format
 *
 */
function summaryTableHeader(header) {
    var newRow = header.insertRow(-1);
    newRow.className = "tablesorter-no-sort";
    var cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Requests";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 3;
    cell.innerHTML = "Executions";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 7;
    cell.innerHTML = "Response Times (ms)";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 1;
    cell.innerHTML = "Throughput";
    newRow.appendChild(cell);

    cell = document.createElement('th');
    cell.setAttribute("data-sorter", false);
    cell.colSpan = 2;
    cell.innerHTML = "Network (KB/sec)";
    newRow.appendChild(cell);
}

/*
 * Populates the table identified by id parameter with the specified data and
 * format
 *
 */
function createTable(table, info, formatter, defaultSorts, seriesIndex, headerCreator) {
    var tableRef = table[0];

    // Create header and populate it with data.titles array
    var header = tableRef.createTHead();

    // Call callback is available
    if(headerCreator) {
        headerCreator(header);
    }

    var newRow = header.insertRow(-1);
    for (var index = 0; index < info.titles.length; index++) {
        var cell = document.createElement('th');
        cell.innerHTML = info.titles[index];
        newRow.appendChild(cell);
    }

    var tBody;

    // Create overall body if defined
    if(info.overall){
        tBody = document.createElement('tbody');
        tBody.className = "tablesorter-no-sort";
        tableRef.appendChild(tBody);
        var newRow = tBody.insertRow(-1);
        var data = info.overall.data;
        for(var index=0;index < data.length; index++){
            var cell = newRow.insertCell(-1);
            cell.innerHTML = formatter ? formatter(index, data[index]): data[index];
        }
    }

    // Create regular body
    tBody = document.createElement('tbody');
    tableRef.appendChild(tBody);

    var regexp;
    if(seriesFilter) {
        regexp = new RegExp(seriesFilter, 'i');
    }
    // Populate body with data.items array
    for(var index=0; index < info.items.length; index++){
        var item = info.items[index];
        if((!regexp || filtersOnlySampleSeries && !info.supportsControllersDiscrimination || regexp.test(item.data[seriesIndex]))
                &&
                (!showControllersOnly || !info.supportsControllersDiscrimination || item.isController)){
            if(item.data.length > 0) {
                var newRow = tBody.insertRow(-1);
                for(var col=0; col < item.data.length; col++){
                    var cell = newRow.insertCell(-1);
                    cell.innerHTML = formatter ? formatter(col, item.data[col]) : item.data[col];
                }
            }
        }
    }

    // Add support of columns sort
    table.tablesorter({sortList : defaultSorts});
}

$(document).ready(function() {

    // Customize table sorter default options
    $.extend( $.tablesorter.defaults, {
        theme: 'blue',
        cssInfoBlock: "tablesorter-no-sort",
        widthFixed: true,
        widgets: ['zebra']
    });

    var data = {"OkPercent": 99.97658216732042, "KoPercent": 0.023417832679585505};
    var dataset = [
        {
            "label" : "FAIL",
            "data" : data.KoPercent,
            "color" : "#FF6347"
        },
        {
            "label" : "PASS",
            "data" : data.OkPercent,
            "color" : "#9ACD32"
        }];
    $.plot($("#flot-requests-summary"), dataset, {
        series : {
            pie : {
                show : true,
                radius : 1,
                label : {
                    show : true,
                    radius : 3 / 4,
                    formatter : function(label, series) {
                        return '<div style="font-size:8pt;text-align:center;padding:2px;color:white;">'
                            + label
                            + '<br/>'
                            + Math.round10(series.percent, -2)
                            + '%</div>';
                    },
                    background : {
                        opacity : 0.5,
                        color : '#000'
                    }
                }
            }
        },
        legend : {
            show : true
        }
    });

    // Creates APDEX table
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6804333107650643, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.9928571428571429, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [0.9785714285714285, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9928571428571429, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [0.9714285714285714, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.6339092872570194, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.8156947444204463, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.7, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.2610427226647357, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.3556515478761699, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9083997103548154, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.8823316437364229, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.9285714285714286, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.8928571428571429, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.04321428571428571, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.8562635771180304, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.4532947139753802, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7170626349892009, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.8917451122375091, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.41383055756698045, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.4714285714285714, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.9357142857142857, 500, 1500, "6.1 Logout-0"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout-1"], "isController": false}, {"data": [0.9928571428571429, 500, 1500, "6.1 Logout-2"], "isController": false}, {"data": [0.7690079652425779, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.8055756698044895, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.19654427645788336, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.8311735061195105, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.926812585499316, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.7997827661115134, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.8388848660391021, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9062273714699494, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.8902968863142651, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.5721428571428572, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.8794351918899348, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.8638667632150615, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
        switch(index){
            case 0:
                item = item.toFixed(3);
                break;
            case 1:
            case 2:
                item = formatDuration(item);
                break;
        }
        return item;
    }, [[0, 0]], 3);

    // Create statistics table
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 34162, 8, 0.023417832679585505, 1123.301446051169, 0, 24544, 380.0, 5093.800000000003, 7261.9000000000015, 14004.930000000011, 6.568415385650698, 148.99496069377952, 6.315727925907767], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 70, 0, 0.0, 111.62857142857142, 86, 1227, 94.0, 105.9, 115.35000000000001, 1227.0, 0.07961575163525067, 0.05776806979003052, 0.06359930159925298], "isController": false}, {"data": ["1.4 Select Organisations-1", 70, 0, 0.0, 156.57142857142867, 100, 1579, 118.0, 145.29999999999998, 216.8000000000003, 1579.0, 0.07961294460986246, 1.0860480695851256, 0.051468524738016545], "isController": false}, {"data": ["2.0 Register attendance", 1400, 0, 0.0, 10088.419285714283, 2818, 46034, 7651.0, 19632.700000000015, 24997.850000000006, 37463.37, 0.2820308477283221, 53.96996638708512, 1.227897311712177], "isController": true}, {"data": ["1.3 Sign-in-1", 70, 0, 0.0, 110.87142857142858, 91, 649, 101.5, 113.8, 118.9, 649.0, 0.07960515841426524, 0.7159799892533036, 0.05255184285941729], "isController": false}, {"data": ["1.3 Sign-in-0", 70, 0, 0.0, 366.02857142857147, 303, 633, 360.0, 435.2, 452.25, 633.0, 0.07958542813549532, 0.05650254517041514, 0.07266833526043763], "isController": false}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 268.4285714285715, 190, 1676, 213.0, 241.8, 774.9500000000025, 1676.0, 0.07960425314152499, 1.1436892306817534, 0.11505302211861033], "isController": false}, {"data": ["2.4 Patient attending session-1", 1389, 0, 0.0, 1331.8963282937357, 359, 24397, 531.0, 3751.0, 6082.5, 12199.599999999988, 0.28009346127965, 13.478773927926648, 0.18709367921414122], "isController": false}, {"data": ["2.4 Patient attending session-0", 1389, 0, 0.0, 1108.3390928725687, 140, 19687, 239.0, 3339.0, 6302.0, 14152.699999999972, 0.2800958335089394, 0.20816050527251673, 0.2292190512504797], "isController": false}, {"data": ["2.3 Search by first/last name", 1400, 0, 0.0, 915.6107142857142, 346, 18590, 503.0, 1211.5000000000014, 3017.7500000000045, 9706.310000000001, 0.2823942514212499, 15.046804861588491, 0.2435997107879445], "isController": false}, {"data": ["1.2 Sign-in page", 70, 0, 0.0, 92.38571428571429, 85, 254, 89.0, 96.9, 101.45, 254.0, 0.07896550673857793, 0.47587513875367615, 0.04757980240010017], "isController": false}, {"data": ["3.0 Nurse triage", 1381, 0, 0.0, 3587.9804489500366, 721, 28709, 1407.0, 9214.0, 12617.399999999998, 19021.76000000001, 0.2788100524247692, 31.512979630954717, 0.83764524311641], "isController": true}, {"data": ["4.2 Vaccination batch-2", 1381, 0, 0.0, 0.31933381607530786, 0, 4, 0.0, 1.0, 1.0, 1.0, 0.2784128812628534, 1.3924672173116364, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1389, 0, 0.0, 2440.3498920086395, 510, 24544, 823.0, 6740.0, 10369.0, 18971.899999999972, 0.28007307306096274, 13.68593638784878, 0.4162804855456888], "isController": false}, {"data": ["4.2 Vaccination batch-0", 1381, 0, 0.0, 458.7501810282402, 92, 11585, 114.0, 553.7999999999988, 2894.8999999999987, 5891.7000000000135, 0.27840569697485296, 0.20826070847647574, 0.2501301183758445], "isController": false}, {"data": ["4.2 Vaccination batch-1", 1381, 0, 0.0, 591.2780593772635, 112, 17921, 148.0, 1388.3999999999985, 3763.3999999999883, 6654.560000000012, 0.2784035642107279, 3.7819361732487637, 0.19991592832267396], "isController": false}, {"data": ["6.1 Logout", 70, 0, 0.0, 604.0714285714283, 259, 7391, 277.5, 467.29999999999995, 4090.000000000001, 7391.0, 0.06191682094274551, 0.38831037509210126, 0.13090812240336333], "isController": false}, {"data": ["1.1 Homepage", 70, 0, 0.0, 274.14285714285705, 247, 473, 261.5, 323.5, 368.70000000000005, 473.0, 0.07892731020236962, 0.40735433048781583, 0.04277798551007338], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 477.07142857142844, 403, 1009, 456.0, 544.4, 610.7500000000003, 1009.0, 0.07957674267382402, 0.7722207929197161, 0.1251934887182915], "isController": false}, {"data": ["2.1 Open session", 1400, 0, 0.0, 4390.967142857146, 1019, 23856, 3188.0, 8551.900000000007, 12090.650000000001, 18447.000000000004, 0.28229904340952716, 4.808477427670953, 0.1853552361683551], "isController": false}, {"data": ["3.3 Nurse triage complete", 1381, 0, 0.0, 855.8254887762499, 141, 17632, 219.0, 2179.399999999998, 5037.5999999999985, 11569.42000000002, 0.2790619477109444, 6.461160933633471, 0.18858483185153663], "isController": false}, {"data": ["4.3 Vaccination confirm", 1381, 0, 0.0, 1950.139029688633, 406, 21407, 734.0, 5455.399999999998, 8664.399999999998, 15039.700000000004, 0.27842421972166853, 6.733277546949058, 0.6476043111752546], "isController": false}, {"data": ["4.1 Vaccination questions", 1389, 8, 0.5759539236861051, 1389.9920806335467, 93, 18430, 430.0, 4534.0, 6358.0, 11786.199999999997, 0.2777759446031974, 3.2205226652371906, 0.5657976816082727], "isController": false}, {"data": ["3.1 Nurse triage new", 1381, 0, 0.0, 600.4619840695144, 109, 15960, 157.0, 1093.1999999999987, 3980.2999999999884, 6596.900000000007, 0.278945436777855, 3.141570551620661, 0.19177498778477534], "isController": false}, {"data": ["3.2 Nurse triage result", 1381, 0, 0.0, 2131.692976104274, 365, 22791, 803.0, 5968.199999999999, 9501.699999999988, 16873.140000000014, 0.2789572130942233, 21.92917353717898, 0.4577902283040573], "isController": false}, {"data": ["1.0 Login", 70, 0, 0.0, 1241.185714285714, 1067, 2998, 1164.0, 1300.4, 1838.750000000002, 2998.0, 0.07884845214856401, 3.708803267761459, 0.3753771525627437], "isController": true}, {"data": ["6.1 Logout-0", 70, 0, 0.0, 410.6, 89, 6926, 101.5, 252.59999999999997, 3905.3500000000013, 6926.0, 0.06192679014868623, 0.044630831181377374, 0.04844078018466569], "isController": false}, {"data": ["6.1 Logout-1", 70, 0, 0.0, 91.41428571428573, 79, 373, 84.0, 94.8, 105.70000000000002, 373.0, 0.06192739278598954, 0.0241299118375096, 0.03949080809497185], "isController": false}, {"data": ["6.1 Logout-2", 70, 0, 0.0, 101.94285714285716, 86, 627, 91.0, 105.6, 140.15000000000003, 627.0, 0.06192646144237345, 0.3196106921122497, 0.042997767661647965], "isController": false}, {"data": ["3.2 Nurse triage result-1", 1381, 0, 0.0, 935.6850108616935, 202, 18146, 411.0, 2435.5999999999967, 4339.499999999998, 7509.2200000000275, 0.2789747948999933, 21.72377215549239, 0.1984190631825388], "isController": false}, {"data": ["3.2 Nurse triage result-0", 1381, 0, 0.0, 1195.9138305575666, 154, 20478, 321.0, 3581.0, 6759.7, 13783.780000000008, 0.2789783453412536, 0.20678614099062564, 0.2594033195342415], "isController": false}, {"data": ["4.0 Vaccination", 1389, 8, 0.5759539236861051, 4373.496040316779, 94, 32639, 1960.0, 10679.0, 13490.5, 22085.1, 0.27785357016832846, 15.243241045311036, 1.6550786694799757], "isController": true}, {"data": ["2.5 Patient return to consent page", 1389, 0, 0.0, 904.5385169186459, 138, 18902, 282.0, 2222.0, 5155.5, 10714.29999999999, 0.28014272152300834, 6.328166605744701, 0.1942395823059921], "isController": false}, {"data": ["1.5 Open Sessions list", 1462, 0, 0.0, 412.8447332421341, 107, 11057, 146.0, 420.4000000000001, 2032.8999999999933, 4982.699999999988, 0.28368397992712696, 3.341320783106522, 0.18352535605056017], "isController": false}, {"data": ["4.2 Vaccination batch", 1381, 0, 0.0, 1050.6430123099196, 206, 19161, 283.0, 3402.7999999999997, 5206.999999999996, 10306.260000000007, 0.2783970538697291, 5.382490034857085, 0.45003360646550444], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 1381, 0, 0.0, 900.5083272990586, 158, 20612, 292.0, 2067.5999999999976, 4935.0, 10724.620000000044, 0.2784424642299221, 0.209921089234257, 0.26696369065405146], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 1381, 0, 0.0, 468.46053584359186, 94, 12825, 118.0, 616.3999999999992, 3216.5999999999995, 5415.160000000011, 0.2784665506422979, 0.20803409300913858, 0.18791053368537877], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 1381, 0, 0.0, 580.9898624185371, 140, 13159, 231.0, 762.3999999999999, 2754.799999999982, 6998.780000000002, 0.2784597004693084, 6.316172537012859, 0.19280071057884735], "isController": false}, {"data": ["2.2 Session register", 1400, 0, 0.0, 1461.1014285714284, 340, 18929, 561.0, 4321.500000000002, 6927.85, 11669.880000000001, 0.2824796629775495, 14.13963617930921, 0.18795656090796226], "isController": false}, {"data": ["4.1 Vaccination questions-0", 1381, 0, 0.0, 703.0695148443167, 106, 17510, 278.0, 1544.9999999999984, 4154.999999999998, 7387.720000000013, 0.2785520376958966, 0.20782593437467287, 0.36912600585574473], "isController": false}, {"data": ["4.1 Vaccination questions-1", 1381, 0, 0.0, 693.639391745112, 106, 18163, 137.0, 2014.0, 4413.899999999993, 8486.080000000013, 0.2785544536641509, 3.0331948070369994, 0.19948022729821543], "isController": false}]}, function(index, item){
        switch(index){
            // Errors pct
            case 3:
                item = item.toFixed(2) + '%';
                break;
            // Mean
            case 4:
            // Mean
            case 7:
            // Median
            case 8:
            // Percentile 1
            case 9:
            // Percentile 2
            case 10:
            // Percentile 3
            case 11:
            // Throughput
            case 12:
            // Kbytes/s
            case 13:
            // Sent Kbytes/s
                item = item.toFixed(2);
                break;
        }
        return item;
    }, [[0, 0]], 0, summaryTableHeader);

    // Create error table
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 8, 100.0, 0.023417832679585505], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 34162, 8, "422/Unprocessable Entity", 8, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 1389, 8, "422/Unprocessable Entity", 8, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
