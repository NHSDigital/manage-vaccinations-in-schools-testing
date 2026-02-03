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

    var data = {"OkPercent": 99.92369001187045, "KoPercent": 0.0763099881295574};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.818609603627121, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5097254004576659, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.9871220604703248, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.37433155080213903, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "Reset counters"], "isController": false}, {"data": [0.46439957492029754, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.4, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.984375, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.9829242262540021, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.42, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.416289592760181, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.9729011689691818, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.6204906204906205, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Check STS status"], "isController": false}, {"data": [0.9110756123535676, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.9853438556933484, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9613347457627118, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.9553666312433581, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9674840085287847, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.416289592760181, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.9291044776119403, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 11794, 9, 0.0763099881295574, 276.152619976259, 0, 8412, 132.0, 664.0, 895.0, 1750.0499999999993, 6.040680608616241, 2364.213342152903, 45.38500003553266], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 874, 0, 0.0, 936.9656750572085, 422, 8412, 746.0, 1548.0, 2045.25, 4099.25, 0.5252498542641995, 220.0109480264067, 5.374377970118151], "isController": false}, {"data": ["4.1 Vaccination questions", 893, 0, 0.0, 157.44792833146687, 72, 5814, 117.0, 229.0, 317.0, 797.1799999999998, 0.5219713096979113, 213.91023093084056, 4.859509557028727], "isController": false}, {"data": ["2.0 Register attendance", 935, 9, 0.9625668449197861, 1333.616042780748, 373, 7884, 1184.0, 2190.7999999999997, 2670.3999999999996, 4189.039999999999, 0.5265707012682751, 1062.7032239299983, 18.5949662208063], "isController": true}, {"data": ["Reset counters", 1, 0, 0.0, 37.0, 37, 37, 37.0, 37.0, 37.0, 37.0, 27.027027027027028, 0.0, 0.0], "isController": false}, {"data": ["1.0 Login", 941, 0, 0.0, 966.3071200850156, 276, 6124, 815.0, 1537.6000000000001, 1856.5, 3221.360000000006, 0.5254388335592924, 908.1722121501867, 17.00032408488629], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 220, 0, 0.0, 1227.1500000000005, 204, 6753, 1005.5, 1853.3000000000002, 2133.7999999999997, 5627.069999999985, 0.13013724155187478, 161.08593120572007, 3.677548586295484], "isController": true}, {"data": ["2.5 Select patient", 928, 0, 0.0, 136.59267241379283, 55, 2044, 102.0, 238.60000000000014, 389.2999999999997, 890.3000000000011, 0.5309604892160095, 223.8108842278344, 3.800591169148678], "isController": false}, {"data": ["Initialise vaccination list", 1, 0, 0.0, 45.0, 45, 45, 45.0, 45.0, 45.0, 45.0, 22.22222222222222, 6.380208333333334, 13.715277777777779], "isController": false}, {"data": ["2.3 Search by first/last name", 937, 0, 0.0, 140.360725720384, 57, 2409, 99.0, 239.0, 391.49999999999955, 899.44, 0.5282891213035266, 224.79674516974177, 3.922089511741324], "isController": false}, {"data": ["4.0 Vaccination for flu", 225, 0, 0.0, 1192.4444444444448, 188, 3924, 1031.0, 1931.2, 2455.299999999999, 3531.8200000000006, 0.13234087480259152, 162.64247035104887, 3.71185538506048], "isController": true}, {"data": ["4.0 Vaccination for hpv", 221, 0, 0.0, 1267.8552036199096, 242, 8251, 1025.0, 1827.6000000000004, 2559.299999999999, 6626.880000000001, 0.12982321133280267, 159.99475059973477, 3.661660623731507], "isController": true}, {"data": ["1.2 Sign-in page", 941, 0, 0.0, 174.56535600425082, 14, 2774, 116.0, 322.80000000000007, 458.89999999999975, 1316.4800000000023, 0.5255929118126588, 219.14184213106842, 4.338129710472872], "isController": false}, {"data": ["Debug Sampler", 937, 0, 0.0, 0.29562433297758844, 0, 8, 0.0, 1.0, 1.0, 1.0, 0.5283913050588533, 3.025186267451152, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 693, 9, 1.2987012987012987, 760.0303030303038, 214, 7342, 600.0, 1235.4, 1810.199999999999, 3014.9599999999773, 0.39310584247176783, 167.6578187406616, 3.417749382900406], "isController": false}, {"data": ["Check STS status", 1, 0, 0.0, 20.0, 20, 20, 20.0, 20.0, 20.0, 20.0, 50.0, 15.673828125, 29.4921875], "isController": false}, {"data": ["1.4 Open Sessions list", 939, 0, 0.0, 360.72204472843487, 177, 3304, 291.0, 634.0, 783.0, 1317.0000000000007, 0.5258362560458569, 251.4801624299935, 3.7625273514302577], "isController": false}, {"data": ["Reset vaccination list", 1, 0, 0.0, 3.0, 3, 3, 3.0, 3.0, 3.0, 3.0, 333.3333333333333, 95.37760416666667, 204.75260416666666], "isController": false}, {"data": ["4.2 Vaccination batch", 887, 0, 0.0, 157.40135287485916, 67, 1684, 110.0, 264.20000000000005, 393.5999999999999, 875.32, 0.5223918834318143, 215.46203021355345, 4.5968533720116325], "isController": false}, {"data": ["1.1 Homepage", 944, 0, 0.0, 208.14724576271217, 28, 5216, 124.0, 406.0, 602.75, 1502.44999999999, 0.5245986181494451, 218.5038024282553, 4.316804142543837], "isController": false}, {"data": ["1.3 Sign-in", 941, 0, 0.0, 223.36450584484604, 62, 3073, 132.0, 472.60000000000014, 714.0, 1154.3800000000024, 0.52584432660912, 219.6567183432006, 4.59225685672223], "isController": false}, {"data": ["2.2 Session register", 938, 0, 0.0, 170.82622601279326, 56, 2559, 99.0, 328.0, 513.2999999999997, 1562.5900000000001, 0.5273787141404964, 228.07944570012756, 3.783862330822756], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 221, 0, 0.0, 1266.6606334841626, 216, 8636, 1054.0, 1881.2, 2456.2999999999993, 7545.620000000002, 0.13061388526072543, 162.08287291261576, 3.690821701149816], "isController": true}, {"data": ["2.1 Open session", 938, 0, 0.0, 322.56396588486143, 93, 2791, 250.0, 563.0, 808.05, 1348.5000000000007, 0.527536802440842, 221.5324052389874, 3.7803600364860874], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, 100.0, 0.0763099881295574], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 11794, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 693, 9, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 9, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
