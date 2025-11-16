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

    var data = {"OkPercent": 80.64516129032258, "KoPercent": 19.35483870967742};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4072739187418086, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.009433962264150943, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.7794117647058824, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.05303030303030303, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.717391304347826, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.06716417910447761, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.003703703703703704, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.004098360655737705, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1209, 234, 19.35483870967742, 13374.445822994216, 0, 60266, 426.0, 46466.0, 60082.0, 60253.0, 1.5885821805491316, 20.546541068429917, 0.7325322274247886], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.0 Register attendance", 244, 229, 93.85245901639344, 60234.819672131154, 21517, 113785, 60087.0, 89292.5, 96519.0, 111513.45000000003, 0.36333962724928076, 18.4510847512017, 0.43199077215999454], "isController": true}, {"data": ["1.0 Login", 69, 5, 7.246376811594203, 21325.782608695652, 2120, 88124, 7751.0, 55133.0, 66627.5, 88124.0, 0.11556588762976039, 5.385600003642837, 0.4455377697374812], "isController": true}, {"data": ["Choose session", 244, 0, 0.0, 0.7459016393442626, 0, 45, 1.0, 1.0, 1.0, 1.0, 0.4120688898121034, 0.0, 0.0], "isController": false}, {"data": ["2.3 Search by first/last name", 53, 37, 69.81132075471699, 41860.00000000001, 771, 60255, 44507.0, 60089.6, 60253.3, 60255.0, 0.08671111292895416, 2.153136375720888, 0.06988239549674834], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 902.0, 902, 902, 902.0, 902.0, 902.0, 902.0, 1.1086474501108647, 28.804263095898005, 0.7221365715077606], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 757.0, 757, 757, 757.0, 757.0, 757.0, 757.0, 1.321003963011889, 23.517482661822985, 0.8604586360634082], "isController": false}, {"data": ["1.2 Sign-in page", 68, 1, 1.4705882352941178, 2911.6470588235297, 87, 29627, 107.5, 12269.600000000002, 20535.149999999994, 29627.0, 0.11500629152065377, 0.6696186489678185, 0.06929578307445643], "isController": false}, {"data": ["Get correct patient name", 14, 0, 0.0, 3.7857142857142865, 0, 43, 1.0, 22.5, 43.0, 43.0, 0.023844113995302712, 0.0, 0.0], "isController": false}, {"data": ["Debug Sampler", 245, 0, 0.0, 0.5224489795918379, 0, 8, 0.0, 1.0, 2.0, 5.539999999999992, 0.38338938120953875, 2.5270002827496687, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 1, 1, 100.0, 60086.0, 60086, 60086, 60086.0, 60086.0, 60086.0, 60086.0, 0.016642811969510368, 0.011279405768398629, 0.013636053947675], "isController": false}, {"data": ["1.5 Open Sessions list", 66, 2, 3.0303030303030303, 6110.60606060606, 756, 31455, 3033.5, 20758.200000000004, 27055.949999999997, 31455.0, 0.11131500121434547, 2.471616651164085, 0.06652810619451116], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 101.0, 101, 101, 101.0, 101.0, 101.0, 101.0, 9.900990099009901, 47.13606126237624, 7.232363861386138], "isController": false}, {"data": ["1.1 Homepage", 69, 1, 1.4492753623188406, 3232.550724637681, 268, 33760, 362.0, 12622.0, 22406.5, 33760.0, 0.11757649288065815, 0.6383154180057323, 0.0637255405749661], "isController": false}, {"data": ["1.3 Sign-in", 67, 1, 1.492537313432836, 9658.79104477612, 969, 53060, 3115.0, 33244.4, 41247.199999999975, 53060.0, 0.11352584153148054, 1.6597859275400138, 0.25110940534062837], "isController": false}, {"data": ["2.2 Session register", 135, 82, 60.74074074074074, 37096.71111111112, 591, 60266, 41277.0, 60086.0, 60251.2, 60263.84, 0.22566194169564055, 12.18713564998997, 0.14809881120035437], "isController": false}, {"data": ["2.1 Open session", 244, 109, 44.67213114754098, 30369.446721311466, 304, 60259, 28968.0, 49250.0, 60085.75, 60258.1, 0.40546850722780853, 3.616912933739134, 0.2625087917287748], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 140.0, 140, 140, 140.0, 140.0, 140.0, 140.0, 7.142857142857142, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 167, 71.36752136752136, 13.813068651778329], "isController": false}, {"data": ["504/Gateway Time-out", 67, 28.632478632478634, 5.5417700578990905], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1209, 234, "502/Bad Gateway", 167, "504/Gateway Time-out", 67, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 53, 37, "502/Bad Gateway", 21, "504/Gateway Time-out", 16, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.2 Sign-in page", 68, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 1, 1, "504/Gateway Time-out", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.5 Open Sessions list", 66, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 69, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 67, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["2.2 Session register", 135, 82, "502/Bad Gateway", 45, "504/Gateway Time-out", 37, "", "", "", "", "", ""], "isController": false}, {"data": ["2.1 Open session", 244, 109, "502/Bad Gateway", 96, "504/Gateway Time-out", 13, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
