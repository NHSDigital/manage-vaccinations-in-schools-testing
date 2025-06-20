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

    var data = {"OkPercent": 100.0, "KoPercent": 0.0};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7960048426150121, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.07142857142857142, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.4928571428571429, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [1.0, 500, 1500, "Vaccination"], "isController": true}, {"data": [0.5428571428571428, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [1.0, 500, 1500, "5.0 Consent for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [1.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [1.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 350, 0, 0.0, 1568.4942857142855, 84, 15207, 373.5, 4544.6, 9495.299999999997, 14148.310000000005, 2.691355366562601, 24.830381533265154, 2.56256980702982], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.2 Sign-in page", 70, 0, 0.0, 88.51428571428572, 84, 108, 88.0, 91.0, 95.70000000000002, 108.0, 1.192504258943782, 7.186468537052811, 0.7185303982112435], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.24707402584888458, 0.0, 0.0], "isController": true}, {"data": ["1.0 Login", 70, 0, 0.0, 7842.471428571425, 1423, 26365, 5065.0, 19013.699999999997, 22994.800000000003, 26365.0, 0.8578431372549019, 39.57220339307598, 4.083970013786765], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 65, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.21185681087053593, 0.0, 0.0], "isController": true}, {"data": ["1.5 Open Sessions list", 70, 0, 0.0, 2371.2999999999993, 271, 15207, 871.5, 8902.699999999993, 11229.150000000001, 15207.0, 0.7994791964091963, 8.690432553936292, 0.4778137384789337], "isController": false}, {"data": ["Vaccination", 83, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.2083600059244532, 0.0, 0.0], "isController": true}, {"data": ["1.4 Select Organisations", 70, 0, 0.0, 2173.214285714286, 356, 13845, 542.5, 5169.7, 8324.05000000001, 13845.0, 0.9770804835152564, 14.038852689414032, 1.4121866363306441], "isController": false}, {"data": ["5.0 Consent for hpv", 2, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.00575571038416489, 0.0, 0.0], "isController": true}, {"data": ["1.1 Homepage", 70, 0, 0.0, 265.3142857142857, 248, 484, 259.0, 273.9, 295.45000000000005, 484.0, 1.188132256093421, 6.132108372513409, 0.6439584005193836], "isController": false}, {"data": ["1.3 Sign-in", 70, 0, 0.0, 2944.128571428572, 416, 15108, 754.0, 9764.9, 11203.900000000001, 15108.0, 0.9979186268639694, 9.6839037061985, 1.5699676834744676], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 58, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.24591067506720146, 0.0, 0.0], "isController": true}, {"data": ["4.0 Vaccination for hpv", 98, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, 0.2528092786164625, 0.0, 0.0], "isController": true}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": []}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 350, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
