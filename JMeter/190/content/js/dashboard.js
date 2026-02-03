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

    var data = {"OkPercent": 23.636363636363637, "KoPercent": 76.36363636363636};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.19402985074626866, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [0.0, 500, 1500, "Search for all scheduled sessions"], "isController": false}, {"data": [0.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "Data prep Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "Sessions page"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.0, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [0.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.0, 500, 1500, "Data prep Homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 55, 42, 76.36363636363636, 41.018181818181816, 0, 490, 24.0, 53.4, 214.39999999999878, 490.0, 0.580842750026402, 49.63031091588341, 0.7440294480673778], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.0 Login", 11, 11, 100.0, 87.72727272727272, 59, 106, 88.0, 105.2, 106.0, 106.0, 1.2106537530266344, 472.8915235320823, 6.6822412227602905], "isController": true}, {"data": ["7.0 Open Children Search", 1, 1, 100.0, 28.0, 28, 28, 28.0, 28.0, 28.0, 28.0, 35.714285714285715, 51.025390625, 44.119698660714285], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 25.0, 25, 25, 25.0, 25.0, 25.0, 25.0, 40.0, 99.8046875, 0.0], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 1, 100.0, 24.0, 24, 24, 24.0, 24.0, 24.0, 24.0, 41.666666666666664, 59.52962239583333, 55.948893229166664], "isController": false}, {"data": ["1.2 Sign-in page", 11, 11, 100.0, 6.909090909090909, 6, 8, 7.0, 7.800000000000001, 8.0, 8.0, 1.2003491924923613, 0.7689737014404191, 0.7173961970755129], "isController": false}, {"data": ["Data prep Sign-in", 1, 0, 0.0, 157.0, 157, 157, 157.0, 157.0, 157.0, 157.0, 6.369426751592357, 2471.517963773885, 20.43939092356688], "isController": false}, {"data": ["7.1 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["7.3 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Data prep Sign-in page", 1, 1, 100.0, 8.0, 8, 8, 8.0, 8.0, 8.0, 8.0, 125.0, 80.078125, 74.70703125], "isController": false}, {"data": ["Sessions page", 1, 1, 100.0, 32.0, 32, 32, 32.0, 32.0, 32.0, 32.0, 31.25, 44.647216796875, 38.604736328125], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, 100.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 47.62369791666667, 50.911458333333336], "isController": false}, {"data": ["1.4 Open Sessions list", 10, 10, 100.0, 26.099999999999998, 23, 29, 26.0, 28.8, 29.0, 29.0, 1.008471157724889, 1.4408137731948365, 1.2458164204316255], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 54.0, 54, 54, 54.0, 54.0, 54.0, 54.0, 18.51851851851852, 46.205873842592595, 0.0], "isController": false}, {"data": ["JSR223 Sampler", 1, 0, 0.0, 490.0, 490, 490, 490.0, 490.0, 490.0, 490.0, 2.0408163265306123, 0.0, 0.0], "isController": false}, {"data": ["1.1 Homepage", 11, 11, 100.0, 15.818181818181815, 13, 24, 15.0, 22.600000000000005, 24.0, 24.0, 1.221950677627194, 0.7828121528549211, 0.7207599700066651], "isController": false}, {"data": ["1.3 Sign-in", 11, 0, 0.0, 41.18181818181817, 34, 55, 39.0, 54.6, 55.0, 55.0, 1.327220077220077, 514.9989772487331, 4.259028489985521], "isController": false}, {"data": ["Run some searches", 1, 1, 100.0, 30.0, 30, 30, 30.0, 30.0, 30.0, 30.0, 33.333333333333336, 140.52734375, 50.911458333333336], "isController": true}, {"data": ["Data prep Homepage", 1, 1, 100.0, 444.0, 444, 444, 444.0, 444.0, 444.0, 444.0, 2.2522522522522523, 1.442849099099099, 1.3284769144144144], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, 4.761904761904762, 3.6363636363636362], "isController": false}, {"data": ["401/Unauthorized", 38, 90.47619047619048, 69.0909090909091], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 4.761904761904762, 3.6363636363636362], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 55, 42, "401/Unauthorized", 38, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": ["7.0 Open Children Search", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.2 Sign-in page", 11, 11, "401/Unauthorized", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["7.1 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Data prep Sign-in page", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Sessions page", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.4 Open Sessions list", 10, 10, "401/Unauthorized", 10, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 11, 11, "401/Unauthorized", 11, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Data prep Homepage", 1, 1, "401/Unauthorized", 1, "", "", "", "", "", "", "", ""], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
