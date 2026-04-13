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

    var data = {"OkPercent": 99.98921018558481, "KoPercent": 0.01078981441519206};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6441281138790036, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.30721925133689837, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.7000556483027268, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9894736842105263, 500, 1500, "7.1 Full name search"], "isController": false}, {"data": [0.37681159420289856, 500, 1500, "7.8 Year group search"], "isController": false}, {"data": [0.5, 500, 1500, "7.9 DOB search"], "isController": false}, {"data": [0.9837209302325581, 500, 1500, "7.4 Partial name search"], "isController": false}, {"data": [0.7008021390374332, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.9924242424242424, 500, 1500, "7.2 First name search"], "isController": false}, {"data": [0.4929906542056075, 500, 1500, "7.7 Due vaccination search"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.7214285714285714, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "7.5 Needs Consent search"], "isController": false}, {"data": [0.7075773745997865, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7069057815845824, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.694910514541387, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.9869791666666666, 500, 1500, "7.6 Needs triage search"], "isController": false}, {"data": [0.9807692307692307, 500, 1500, "7.3 Last name search"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 9268, 1, 0.01078981441519206, 833.4012731981018, 4, 60010, 240.0, 3419.1000000000004, 3651.0, 4086.9299999999985, 2.5649363678253807, 191.8242218148108, 21.15996531823352], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Reset counters", 1, 0, 0.0, 33.0, 33, 33, 33.0, 33.0, 33.0, 33.0, 30.303030303030305, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 1870, 0, 0.0, 2488.928877005343, 347, 13203, 849.0, 10392.7, 11063.349999999995, 12082.029999999999, 0.5201002041184705, 121.80755852222428, 13.907550565577683], "isController": true}, {"data": ["7.0 Open Children Search", 1797, 0, 0.0, 830.0712298274912, 80, 4890, 209.0, 3415.2000000000007, 3600.2, 4044.899999999999, 0.5008488230888799, 35.236351930539485, 3.6173794053862567], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 43.0, 43, 43, 43.0, 43.0, 43.0, 43.0, 23.25581395348837, 6.676962209302326, 14.353197674418606], "isController": false}, {"data": ["7.1 Full name search", 190, 0, 0.0, 191.44736842105263, 145, 778, 162.5, 241.70000000000002, 463.6499999999998, 727.0400000000002, 0.05506191422455002, 1.7677033812326102, 0.41070793891011026], "isController": false}, {"data": ["7.8 Year group search", 207, 0, 0.0, 1495.8599033816427, 1312, 3091, 1429.0, 1703.4000000000003, 1926.9999999999998, 2596.7999999999993, 0.061527870787904504, 8.465224940192382, 0.4690971856869527], "isController": false}, {"data": ["7.9 DOB search", 184, 0, 0.0, 631.2065217391303, 527, 1280, 591.5, 739.0, 843.5, 1263.0, 0.05354710267977057, 1.7189379900723962, 0.4064454041816795], "isController": false}, {"data": ["7.4 Partial name search", 215, 0, 0.0, 191.26976744186038, 149, 599, 167.0, 238.80000000000004, 453.7999999999998, 590.7200000000001, 0.06155842452808309, 1.97345247757627, 0.45798533959277526], "isController": false}, {"data": ["1.2 Sign-in page", 1870, 0, 0.0, 815.8385026737966, 13, 6003, 213.5, 3409.2000000000007, 3665.3499999999995, 4108.19, 0.5201266772694629, 36.48802777299141, 4.5306945513844825], "isController": false}, {"data": ["7.2 First name search", 198, 0, 0.0, 183.53535353535364, 143, 892, 164.0, 207.29999999999998, 307.09999999999997, 654.3999999999978, 0.055530018602556235, 1.77847515988719, 0.41328880233669196], "isController": false}, {"data": ["7.7 Due vaccination search", 214, 0, 0.0, 707.1775700934583, 544, 4950, 638.5, 862.0, 1016.75, 2363.4499999999966, 0.0606397035341896, 8.086129688809226, 0.4600311387711279], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 29.0, 29, 29, 29.0, 29.0, 29.0, 29.0, 34.48275862068965, 10.809536637931034, 20.339439655172413], "isController": false}, {"data": ["1.4 Open Sessions list", 70, 0, 0.0, 538.0999999999997, 334, 1202, 514.5, 868.3999999999999, 962.9000000000001, 1202.0, 0.078739006066278, 6.51582960717391, 0.5649150202246761], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 4.0, 4, 4, 4.0, 4.0, 4.0, 4.0, 250.0, 71.533203125, 153.564453125], "isController": false}, {"data": ["7.5 Needs Consent search", 203, 1, 0.49261083743842365, 3965.2512315270933, 3316, 60010, 3613.0, 4012.0, 4377.799999999998, 4886.4400000000005, 0.05822027224143459, 7.930529424199357, 0.44055828284827914], "isController": false}, {"data": ["1.1 Homepage", 1874, 0, 0.0, 821.2721451440754, 31, 4909, 215.0, 3420.0, 3633.25, 4120.0, 0.5207104669194641, 47.06203589491485, 4.525785982961875], "isController": false}, {"data": ["1.3 Sign-in", 1868, 0, 0.0, 834.7296573875797, 146, 5026, 292.0, 3413.1000000000004, 3696.2, 4117.529999999997, 0.519958848653006, 36.726959112581525, 4.720978831231045], "isController": false}, {"data": ["Run some searches", 1788, 1, 0.05592841163310962, 878.4071588366901, 0, 60010, 249.5, 3447.3, 3652.55, 4132.44, 0.5003468567835477, 35.93268818633289, 3.7603666029771476], "isController": true}, {"data": ["7.6 Needs triage search", 192, 0, 0.0, 202.88541666666663, 136, 1035, 171.5, 258.00000000000017, 486.44999999999993, 805.2899999999984, 0.05629057428992519, 3.7123259825087302, 0.42751466917340514], "isController": false}, {"data": ["7.3 Last name search", 182, 0, 0.0, 196.3351648351648, 145, 1579, 164.0, 232.10000000000005, 480.79999999999995, 780.5399999999879, 0.0553180055852949, 1.7737326924169956, 0.41175624780019743], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["504/Gateway Time-out", 1, 100.0, 0.01078981441519206], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 9268, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.5 Needs Consent search", 203, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
