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

    var data = {"OkPercent": 91.03807906863933, "KoPercent": 8.961920931360659};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.3484223650139062, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "5.0 Consent for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.6902050113895216, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8130841121495327, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.23828125, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.8675, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.34615384615384615, 500, 1500, "5.8 Consent confirm"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9230769230769231, 500, 1500, "5.9 Patient home page"], "isController": false}, {"data": [0.16636528028933092, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "6.1 Logout"], "isController": false}, {"data": [0.4807692307692308, 500, 1500, "5.4 Consent route"], "isController": false}, {"data": [0.9444444444444444, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4861111111111111, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.32182182182182184, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.5, 500, 1500, "5.6 Consent questions"], "isController": false}, {"data": [0.3295, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.46518105849582175, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.4482758620689655, 500, 1500, "5.3 Consent parent details"], "isController": false}, {"data": [0.42424242424242425, 500, 1500, "5.2 Consent who"], "isController": false}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.0, 500, 1500, "5.0 Consent for td_ipv"], "isController": true}, {"data": [0.7360655737704918, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.7049382716049383, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.47058823529411764, 500, 1500, "5.1 Consent start"], "isController": false}, {"data": [0.5, 500, 1500, "5.5 Consent agree"], "isController": false}, {"data": [0.9027777777777778, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.48388671875, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [0.5, 500, 1500, "5.7 Consent triage"], "isController": false}, {"data": [0.0, 500, 1500, "5.0 Consent for flu"], "isController": true}, {"data": [0.22586872586872586, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 8246, 739, 8.961920931360659, 1049.4858113024477, 153, 10423, 889.0, 1745.0, 2185.5999999999985, 3779.119999999999, 2.6221563626881714, 64.04160169789475, 3.3224493146690985], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["5.0 Consent for menacwy", 6, 0, 0.0, 6698.0, 5842, 7138, 6836.5, 7138.0, 7138.0, 7138.0, 0.002729524585055398, 0.6132478506415521, 0.043779015414990095], "isController": true}, {"data": ["2.0 Register attendance", 998, 593, 59.4188376753507, 4637.59619238477, 492, 15824, 5006.0, 8589.7, 9759.449999999997, 12985.14, 0.4161990682645708, 48.00558130756882, 1.1696679824583351], "isController": true}, {"data": ["2.5 Select patient", 439, 34, 7.744874715261959, 699.4988610478365, 396, 4260, 500.0, 1194.0, 1503.0, 3978.4, 0.18287117746127315, 4.376074944196173, 0.12679544531006245], "isController": false}, {"data": ["1.4 Select Organisations", 71, 0, 0.0, 585.7605633802817, 529, 1403, 559.0, 642.6, 730.1999999999992, 1403.0, 0.03472468460449318, 0.498963876240735, 0.05023864814601974], "isController": false}, {"data": ["2.5 Select menacwy", 214, 4, 1.8691588785046729, 571.1448598130845, 398, 1405, 449.0, 893.5, 969.75, 1256.3499999999995, 0.08840929371715636, 1.9855777014151685, 0.0616447614395016], "isController": false}, {"data": ["2.3 Search by first/last name", 640, 80, 12.5, 1613.3718750000007, 346, 10238, 1355.5, 2493.3999999999996, 3159.4499999999994, 5444.040000000002, 0.267028935923069, 13.167185584641079, 0.23092037833410659], "isController": false}, {"data": ["2.5 Select td_ipv", 200, 1, 0.5, 526.4750000000001, 398, 1283, 438.0, 866.0, 887.95, 1216.760000000002, 0.0793151926268597, 1.8366226779238057, 0.05522630111616305], "isController": false}, {"data": ["4.0 Vaccination for flu", 371, 68, 18.328840970350406, 2769.323450134772, 692, 10074, 2681.0, 3523.2, 4035.799999999995, 7047.799999999992, 0.1541406926442898, 6.926324504407551, 0.8176158655799679], "isController": true}, {"data": ["5.8 Consent confirm", 26, 0, 0.0, 1382.9615384615386, 1078, 2003, 1323.0, 1674.7, 1907.4499999999996, 2003.0, 0.009236575702974462, 0.9079070994097117, 0.020382288879411528], "isController": false}, {"data": ["4.0 Vaccination for hpv", 299, 20, 6.688963210702341, 2764.13043478261, 588, 5369, 2685.0, 3177.0, 3470.0, 4139.0, 0.1235376386957896, 6.081568121040029, 0.7123745869597552], "isController": true}, {"data": ["1.2 Sign-in page", 72, 0, 0.0, 159.48611111111114, 154, 180, 157.0, 169.7, 173.35, 180.0, 0.03523271945213121, 0.21232530443271652, 0.021279744428214557], "isController": false}, {"data": ["5.9 Patient home page", 26, 0, 0.0, 487.2692307692307, 407, 1009, 435.5, 663.3000000000004, 1005.85, 1009.0, 0.009250874830326501, 0.22700293114858505, 0.006906536921664659], "isController": false}, {"data": ["2.4 Patient attending session", 553, 119, 21.518987341772153, 1742.802893309224, 489, 10423, 1492.0, 2640.8, 3267.199999999998, 5477.940000000009, 0.23040236251999355, 9.241339108660545, 0.3235289051325564], "isController": false}, {"data": ["6.1 Logout", 2, 0, 0.0, 474.5, 471, 478, 474.5, 478.0, 478.0, 478.0, 0.00791875358818522, 0.04966233939777879, 0.016742286639083007], "isController": false}, {"data": ["5.4 Consent route", 26, 0, 0.0, 623.5769230769229, 535, 1511, 564.5, 792.9000000000001, 1282.4499999999991, 1511.0, 0.00921713223819622, 0.1048209916597361, 0.01465068431446161], "isController": false}, {"data": ["1.1 Homepage", 72, 0, 0.0, 467.7499999999999, 153, 716, 467.5, 505.4, 531.8, 716.0, 0.03523121955802435, 0.1818330032853112, 0.019197306512099478], "isController": false}, {"data": ["1.3 Sign-in", 72, 1, 1.3888888888888888, 776.4305555555553, 565, 7734, 626.0, 845.9, 1015.9999999999999, 7734.0, 0.0352117842104491, 0.33921955846501073, 0.0551244378952156], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 199, 7, 3.5175879396984926, 2679.4371859296493, 470, 3773, 2629.0, 3087.0, 3240.0, 3557.0, 0.07589637817906662, 4.169276076436615, 0.4427931824171356], "isController": true}, {"data": ["2.1 Open session", 999, 222, 22.22222222222222, 1099.4194194194201, 329, 6344, 979.0, 1762.0, 2047.0, 3510.0, 0.4174355168679048, 5.703421839116841, 0.2743533823558907], "isController": false}, {"data": ["5.6 Consent questions", 26, 0, 0.0, 653.1153846153845, 536, 987, 575.5, 901.3000000000001, 967.05, 987.0, 0.009224994056974982, 0.11304325180597, 0.02304134915094574], "isController": false}, {"data": ["4.3 Vaccination confirm", 1000, 28, 2.8, 1358.6040000000005, 624, 4083, 1308.5, 1713.9, 1925.9499999999998, 2342.7300000000005, 0.3409414416026975, 6.981483203946056, 0.7872134786724082], "isController": false}, {"data": ["4.1 Vaccination questions", 1077, 53, 4.921077065923862, 820.4568245125333, 469, 5254, 842.0, 1058.2, 1244.7999999999993, 2195.9600000000046, 0.3661998553561574, 4.058683850900896, 0.7152955216044314], "isController": false}, {"data": ["5.3 Consent parent details", 29, 3, 10.344827586206897, 648.1379310344826, 534, 1191, 587.0, 915.0, 1144.0, 1191.0, 0.0102810666358471, 0.10475325340365346, 0.018228328375673012], "isController": false}, {"data": ["5.2 Consent who", 33, 4, 12.121212121212121, 862.5151515151514, 547, 2845, 629.0, 1615.600000000001, 2378.099999999998, 2845.0, 0.01170520338854997, 0.2198920415568417, 0.0183028894959633], "isController": false}, {"data": ["1.0 Login", 72, 1, 1.3888888888888888, 2418.263888888889, 1222, 9370, 2278.5, 2623.4, 2838.6, 9370.0, 0.035194692640349835, 1.6116269753326755, 0.16653608427515798], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 208, 10, 4.8076923076923075, 2669.6346153846152, 551, 4168, 2642.5, 3040.7, 3228.749999999999, 3725.04, 0.08262824559180297, 4.208028221667351, 0.4776452763706258], "isController": true}, {"data": ["5.0 Consent for td_ipv", 5, 0, 0.0, 6598.0, 5925, 6952, 6815.0, 6952.0, 6952.0, 6952.0, 0.002275104757198545, 0.5118528016606899, 0.036480327197603316], "isController": true}, {"data": ["2.5 Select hpv", 305, 3, 0.9836065573770492, 663.770491803279, 395, 4651, 510.0, 945.8000000000001, 1077.0, 1686.06, 0.12755096706634028, 2.740550472858618, 0.0950404178433766], "isController": false}, {"data": ["2.5 Select flu", 405, 24, 5.925925925925926, 679.4567901234568, 389, 4761, 509.0, 994.4000000000008, 1259.0, 3042.2799999999997, 0.16840575057819307, 3.3075698306919272, 0.11676570596730185], "isController": false}, {"data": ["5.1 Consent start", 34, 1, 2.9411764705882355, 976.0588235294118, 709, 1664, 1001.5, 1219.0, 1455.5, 1664.0, 0.012059709751162077, 0.14643319674529717, 0.02551534753245924], "isController": false}, {"data": ["5.5 Consent agree", 26, 0, 0.0, 655.8076923076924, 539, 1057, 603.5, 930.0, 1032.1499999999999, 1057.0, 0.009221679601254574, 0.18237062914554397, 0.014486806990777965], "isController": false}, {"data": ["1.5 Open Sessions list", 72, 1, 1.3888888888888888, 475.18055555555543, 371, 2751, 409.0, 606.1, 727.0499999999995, 2751.0, 0.03524465419364881, 0.38092507151727745, 0.021140195616397184], "isController": false}, {"data": ["4.2 Vaccination batch", 1024, 24, 2.34375, 683.7099609374997, 495, 5229, 592.0, 883.5, 1000.25, 1676.25, 0.3482945810261085, 6.973096826488756, 0.5587764776372091], "isController": false}, {"data": ["5.0 Consent for hpv", 6, 0, 0.0, 6963.333333333334, 6137, 7795, 6928.0, 7795.0, 7795.0, 7795.0, 0.002739393297435106, 0.6078011044092361, 0.04390519804443844], "isController": true}, {"data": ["5.7 Consent triage", 26, 0, 0.0, 859.8076923076924, 559, 1247, 876.5, 1178.8, 1227.05, 1247.0, 0.009234217036064946, 0.15739720163268062, 0.015521004070158741], "isController": false}, {"data": ["5.0 Consent for flu", 17, 8, 47.05882352941177, 5100.8823529411775, 966, 7662, 6357.0, 7638.8, 7662.0, 7662.0, 0.007741457188147919, 1.0425378770715799, 0.07740567774408473], "isController": true}, {"data": ["2.2 Session register", 777, 137, 17.63191763191763, 1577.0154440154445, 488, 7394, 1377.0, 2609.0, 2970.299999999999, 4847.540000000002, 0.32466745611975173, 15.559447735486279, 0.21609934889445928], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["500/Internal Server Error", 738, 99.86468200270636, 8.949793839437303], "isController": false}, {"data": ["422/Unprocessable Entity", 1, 0.13531799729364005, 0.01212709192335678], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 8246, 739, "500/Internal Server Error", 738, "422/Unprocessable Entity", 1, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select patient", 439, 34, "500/Internal Server Error", 34, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select menacwy", 214, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.3 Search by first/last name", 640, 80, "500/Internal Server Error", 80, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.5 Select td_ipv", 200, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 553, 119, "500/Internal Server Error", 119, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.3 Sign-in", 72, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 999, 222, "500/Internal Server Error", 222, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["4.3 Vaccination confirm", 1000, 28, "500/Internal Server Error", 28, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.1 Vaccination questions", 1077, 53, "500/Internal Server Error", 52, "422/Unprocessable Entity", 1, "", "", "", "", "", ""], "isController": false}, {"data": ["5.3 Consent parent details", 29, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.2 Consent who", 33, 4, "500/Internal Server Error", 4, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.5 Select hpv", 305, 3, "500/Internal Server Error", 3, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.5 Select flu", 405, 24, "500/Internal Server Error", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["5.1 Consent start", 34, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 72, 1, "500/Internal Server Error", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["4.2 Vaccination batch", 1024, 24, "500/Internal Server Error", 24, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 777, 137, "500/Internal Server Error", 137, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
