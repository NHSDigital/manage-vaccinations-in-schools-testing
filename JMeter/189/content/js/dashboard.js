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

    var data = {"OkPercent": 22.22222222222222, "KoPercent": 77.77777777777777};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.18181818181818182, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "Search for all scheduled sessions"], "isController": false}, {"data": [0.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "Data prep Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "Sessions page"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.0, 500, 1500, "Data prep Homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 54, 42, 77.77777777777777, 122.83333333333336, 0, 4697, 28.5, 50.0, 213.75, 4697.0, 0.5216332917958675, 45.39652959906685, 0.6805590019174853], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.0 Login", 11, 11, 100.0, 529.6363636363636, 86, 4766, 102.0, 3841.000000000003, 4766.0, 4766.0, 0.7991282237559026, 312.14619562749726, 4.410813203777697], "isController": true}, {"data": ["7.0 Open Children Search", 1, 1, 100.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 35.7177734375, 30.8837890625], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 2.0, 2, 2, 2.0, 2.0, 2.0, 2.0, 500.0, 1247.55859375, 0.0], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 1, 100.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 39.68641493055556, 37.29926215277778], "isController": false}, {"data": ["1.2 Sign-in page", 11, 11, 100.0, 7.909090909090909, 7, 10, 8.0, 9.8, 10.0, 10.0, 1.094854185328954, 0.701390962476361, 0.6543464467005076], "isController": false}, {"data": ["Data prep Sign-in", 1, 0, 0.0, 129.0, 129, 129, 129.0, 129.0, 129.0, 129.0, 7.751937984496124, 3007.9714752906975, 24.875847868217054], "isController": false}, {"data": ["7.1 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["7.3 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Data prep Sign-in page", 1, 1, 100.0, 9.0, 9, 9, 9.0, 9.0, 9.0, 9.0, 111.1111111111111, 71.18055555555556, 66.40625], "isController": false}, {"data": ["Sessions page", 1, 1, 100.0, 40.0, 40, 40, 40.0, 40.0, 40.0, 40.0, 25.0, 35.7177734375, 30.8837890625], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, 100.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 39.68641493055556, 42.42621527777778], "isController": false}, {"data": ["1.4 Open Sessions list", 10, 10, 100.0, 498.09999999999997, 26, 4697, 29.5, 4232.200000000002, 4697.0, 4697.0, 0.7078142695356738, 1.0112619886041903, 0.8743994638306908], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 47.0, 47, 47, 47.0, 47.0, 47.0, 47.0, 21.27659574468085, 53.087599734042556, 0.0], "isController": false}, {"data": ["1.1 Homepage", 11, 11, 100.0, 23.272727272727273, 16, 33, 23.0, 32.400000000000006, 33.0, 33.0, 1.220865704772475, 0.7821170921198668, 0.7201200055493896], "isController": false}, {"data": ["1.3 Sign-in", 11, 0, 0.0, 45.63636363636364, 38, 55, 45.0, 54.0, 55.0, 55.0, 1.0927876018279357, 424.03253759561886, 3.5067383394595666], "isController": false}, {"data": ["Run some searches", 1, 1, 100.0, 36.0, 36, 36, 36.0, 36.0, 36.0, 36.0, 27.777777777777775, 117.10611979166667, 42.42621527777778], "isController": true}, {"data": ["Data prep Homepage", 1, 1, 100.0, 468.0, 468, 468, 468.0, 468.0, 468.0, 468.0, 2.136752136752137, 1.3688568376068375, 1.260349893162393], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, 4.761904761904762, 3.7037037037037037], "isController": false}, {"data": ["401/Unauthorized", 38, 90.47619047619048, 70.37037037037037], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 4.761904761904762, 3.7037037037037037], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 54, 42, "401/Unauthorized", 38, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.2 Sign-in page", 11, 11, "401/Unauthorized", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.1 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Data prep Sign-in page", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sessions page", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 10, 10, "401/Unauthorized", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.1 Homepage", 11, 11, "401/Unauthorized", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Data prep Homepage", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
