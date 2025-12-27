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

    var data = {"OkPercent": 90.9090909090909, "KoPercent": 9.090909090909092};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7388059701492538, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.5454545454545454, 500, 1500, "1.0 Login"], "isController": true}, {"data": [1.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "Search for all scheduled sessions"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Name search"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in page"], "isController": false}, {"data": [0.5, 500, 1500, "Sessions page"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.5, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [0.5, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 55, 5, 9.090909090909092, 805.7454545454545, 0, 31221, 165.0, 575.1999999999999, 691.7999999999982, 31221.0, 0.299355569102151, 109.0188136470761, 1.1037779863439432], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.0 Login", 11, 0, 0.0, 898.4545454545455, 418, 994, 948.0, 990.8, 994.0, 994.0, 1.1084240225715438, 1766.81145849078, 17.848539525392987], "isController": true}, {"data": ["7.0 Open Children Search", 1, 0, 0.0, 165.0, 165, 165, 165.0, 165.0, 165.0, 165.0, 6.0606060606060606, 2451.089015151515, 24.668560606060606], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 2495.1171875, 0.0], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 0, 0.0, 407.0, 407, 407, 407.0, 407.0, 407.0, 407.0, 2.457002457002457, 1099.0143197174448, 10.135135135135135], "isController": false}, {"data": ["1.2 Sign-in page", 11, 0, 0.0, 18.363636363636363, 15, 21, 18.0, 21.0, 21.0, 21.0, 1.1870076615949066, 461.9569524252725, 4.16495950010791], "isController": false}, {"data": ["Data prep Sign-in", 1, 0, 0.0, 365.0, 365, 365, 365.0, 365.0, 365.0, 365.0, 2.73972602739726, 1089.9828767123288, 15.45376712328767], "isController": false}, {"data": ["7.1 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["7.3 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Data prep Sign-in page", 1, 0, 0.0, 52.0, 52, 52, 52.0, 52.0, 52.0, 52.0, 19.230769230769234, 7484.187199519231, 67.47671274038461], "isController": false}, {"data": ["Sessions page", 1, 0, 0.0, 610.0, 610, 610, 610.0, 610.0, 610.0, 610.0, 1.639344262295082, 754.0871542008197, 6.672643442622951], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, 100.0, 31221.0, 31221, 31221, 31221.0, 31221.0, 31221.0, 31221.0, 0.03202972358348548, 0.021238459290221324, 0.03196716552961148], "isController": false}, {"data": ["1.4 Open Sessions list", 10, 0, 0.0, 551.1, 522, 596, 543.5, 594.7, 596.0, 596.0, 1.0007004903432402, 460.3153848318823, 4.07316371460022], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 26.0, 26, 26, 26.0, 26.0, 26.0, 26.0, 38.46153846153847, 95.96604567307693, 0.0], "isController": false}, {"data": ["JSR223 Sampler", 1, 0, 0.0, 567.0, 567, 567, 567.0, 567.0, 567.0, 567.0, 1.763668430335097, 0.0, 0.0], "isController": false}, {"data": ["1.1 Homepage", 11, 0, 0.0, 50.09090909090909, 41, 67, 49.0, 64.60000000000001, 67.0, 67.0, 1.2168141592920354, 473.0828479327987, 3.958210902931416], "isController": false}, {"data": ["1.3 Sign-in", 11, 0, 0.0, 329.0, 297, 345, 331.0, 344.8, 345.0, 345.0, 1.1123470522803114, 442.5403225806452, 6.274332591768633], "isController": false}, {"data": ["Run some searches", 1, 1, 100.0, 31221.0, 31221, 31221, 31221.0, 31221.0, 31221.0, 31221.0, 0.03202972358348548, 0.11050880216841229, 0.03196716552961148], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 1019.0, 1019, 1019, 1019.0, 1019.0, 1019.0, 1019.0, 0.9813542688910696, 381.5388478287537, 3.1922764352306188], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, 40.0, 3.6363636363636362], "isController": false}, {"data": ["502/Bad Gateway", 1, 20.0, 1.8181818181818181], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 40.0, 3.6363636363636362], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 55, 5, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "502/Bad Gateway", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.1 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 59: https://qa.mavistesting.com/patients?q=NoMoreVaccinations+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
