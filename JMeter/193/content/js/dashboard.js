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

    var data = {"OkPercent": 98.19494584837545, "KoPercent": 1.8050541516245486};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7136627906976745, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.047619047619047616, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [1.0, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9523809523809523, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.16666666666666666, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.25, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.0, 500, 1500, "7.1 Name search"], "isController": false}, {"data": [0.0, 500, 1500, "7.3 Name search"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in page"], "isController": false}, {"data": [0.3684210526315789, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "JSR223 Sampler"], "isController": false}, {"data": [1.0, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [1.0, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "Run some searches"], "isController": true}, {"data": [0.25, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.5, 500, 1500, "Data prep Homepage"], "isController": false}, {"data": [0.7619047619047619, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.25, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [1.0, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.54, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.25, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "7.0 Open Children Search"], "isController": false}, {"data": [0.0, 500, 1500, "Initialise vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "Search for all scheduled sessions"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep Sign-in"], "isController": false}, {"data": [0.5, 500, 1500, "Sessions page"], "isController": false}, {"data": [0.0, 500, 1500, "7.2 No Consent search"], "isController": false}, {"data": [0.5217391304347826, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.0, 500, 1500, "Reset vaccination list"], "isController": false}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9047619047619048, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 277, 5, 1.8050541516245486, 612.7978339350177, 0, 49765, 165.0, 1118.4, 1820.3999999999992, 4911.239999999984, 0.6534421302685246, 260.5747862638267, 2.989362748697244], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 21, 0, 0.0, 2726.857142857143, 698, 7465, 1901.0, 5785.400000000001, 7300.999999999998, 7465.0, 0.07660319544758153, 154.64480611526045, 1.6095826094787336], "isController": true}, {"data": ["2.5 Select patient", 20, 0, 0.0, 141.85, 71, 391, 122.5, 274.10000000000014, 385.44999999999993, 391.0, 0.12447022361075671, 50.61716566908969, 0.512880528811745], "isController": false}, {"data": ["2.3 Search by first/last name", 21, 0, 0.0, 246.1428571428571, 67, 2937, 111.0, 267.40000000000003, 2670.899999999996, 2937.0, 0.07721865749848321, 31.392346763481093, 0.3308688765144969], "isController": false}, {"data": ["4.0 Vaccination for flu", 6, 0, 0.0, 1794.6666666666665, 248, 2685, 1853.0, 2685.0, 2685.0, 2685.0, 0.038198069724209936, 43.07805342835634, 0.6011968330617027], "isController": true}, {"data": ["4.0 Vaccination for hpv", 6, 0, 0.0, 1809.5, 269, 2886, 2007.5, 2886.0, 2886.0, 2886.0, 0.03919980138767297, 44.14019497613712, 0.6178817652323895], "isController": true}, {"data": ["1.2 Sign-in page", 28, 0, 0.0, 96.21428571428571, 17, 355, 88.5, 195.90000000000003, 295.14999999999964, 355.0, 0.0951772336057215, 37.819931206830326, 0.4193647270197969], "isController": false}, {"data": ["7.1 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["7.3 Name search", 1, 1, 100.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, Infinity, NaN], "isController": false}, {"data": ["Data prep Sign-in page", 1, 0, 0.0, 44.0, 44, 44, 44.0, 44.0, 44.0, 44.0, 22.727272727272727, 8491.321910511364, 79.7452059659091], "isController": false}, {"data": ["2.4 Patient attending session", 19, 0, 0.0, 1554.8947368421052, 911, 4792, 1128.0, 3370.0, 4792.0, 4792.0, 0.11939773269989694, 48.706100713558556, 0.604101223748209], "isController": false}, {"data": ["JSR223 Sampler", 1, 0, 0.0, 433.0, 433, 433, 433.0, 433.0, 433.0, 433.0, 2.3094688221709005, 0.0, 0.0], "isController": false}, {"data": ["1.1 Homepage", 29, 0, 0.0, 112.24137931034483, 36, 302, 95.0, 217.0, 277.0, 302.0, 0.0974891501299295, 38.73009272604877, 0.4215742596287344], "isController": false}, {"data": ["1.3 Sign-in", 25, 0, 0.0, 236.83999999999995, 79, 425, 281.0, 363.0, 406.4, 425.0, 0.08556662217202314, 34.27987398175719, 0.45896131212136765], "isController": false}, {"data": ["Run some searches", 1, 1, 100.0, 49765.0, 49765, 49765, 49765.0, 49765.0, 49765.0, 49765.0, 0.020094443886265446, 0.06881954561438762, 0.020055196925550085], "isController": true}, {"data": ["4.0 Vaccination for td_ipv", 4, 0, 0.0, 1790.5, 1276, 2784, 1551.0, 2784.0, 2784.0, 2784.0, 0.026043192634985123, 31.243934275934134, 0.43665583432623], "isController": true}, {"data": ["Data prep Homepage", 1, 0, 0.0, 640.0, 640, 640, 640.0, 640.0, 640.0, 640.0, 1.5625, 607.4874877929688, 5.08270263671875], "isController": false}, {"data": ["2.1 Open session", 21, 0, 0.0, 492.04761904761904, 293, 923, 487.0, 703.6, 901.4999999999997, 923.0, 0.07692899453804139, 30.956464943274028, 0.3160370738225285], "isController": false}, {"data": ["4.3 Vaccination confirm", 18, 0, 0.0, 1631.6666666666665, 1011, 2642, 1488.0, 2539.4, 2642.0, 2642.0, 0.11272262718869767, 45.50773055104143, 0.6740240686292929], "isController": false}, {"data": ["4.1 Vaccination questions", 20, 0, 0.0, 159.6, 119, 371, 132.0, 303.9000000000002, 368.19999999999993, 371.0, 0.12469216621465758, 49.20726102941176, 0.7035244045949063], "isController": false}, {"data": ["1.0 Login", 25, 0, 0.0, 954.04, 376, 1248, 973.0, 1185.0, 1237.2, 1248.0, 0.08629438120025129, 139.53959871171116, 1.5266959219001333], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 4, 0, 0.0, 1614.0, 1358, 2140, 1479.0, 2140.0, 2140.0, 2140.0, 0.025602621708462947, 30.630505313744127, 0.42925645586108013], "isController": true}, {"data": ["7.0 Open Children Search", 1, 0, 0.0, 147.0, 147, 147, 147.0, 147.0, 147.0, 147.0, 6.802721088435374, 2751.2223639455783, 27.689200680272112], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, 100.0, 1.0, 1, 1, 1.0, 1.0, 1.0, 1.0, 1000.0, 2495.1171875, 0.0], "isController": false}, {"data": ["Search for all scheduled sessions", 1, 0, 0.0, 452.0, 452, 452, 452.0, 452.0, 452.0, 452.0, 2.2123893805309733, 956.7050089878318, 9.126106194690266], "isController": false}, {"data": ["Data prep Sign-in", 1, 0, 0.0, 349.0, 349, 349, 349.0, 349.0, 349.0, 349.0, 2.865329512893983, 86.55869448424069, 16.162249283667624], "isController": false}, {"data": ["Sessions page", 1, 0, 0.0, 545.0, 545, 545, 545.0, 545.0, 545.0, 545.0, 1.834862385321101, 143.45255160550457, 7.468463302752293], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, 100.0, 49765.0, 49765, 49765, 49765.0, 49765.0, 49765.0, 49765.0, 0.020094443886265446, 0.013324343162865468, 0.020055196925550085], "isController": false}, {"data": ["1.4 Open Sessions list", 23, 0, 0.0, 561.4347826086955, 498, 784, 547.0, 669.8000000000002, 768.5999999999998, 784.0, 0.08033867993069917, 36.95524357792677, 0.329353794299796], "isController": false}, {"data": ["Reset vaccination list", 1, 1, 100.0, 79.0, 79, 79, 79.0, 79.0, 79.0, 79.0, 12.658227848101266, 31.583761867088608, 0.0], "isController": false}, {"data": ["4.2 Vaccination batch", 20, 0, 0.0, 134.04999999999998, 115, 207, 129.5, 145.9, 203.94999999999996, 207.0, 0.1244725475796313, 49.46273442653941, 0.6389550257346992], "isController": false}, {"data": ["2.2 Session register", 21, 0, 0.0, 446.7619047619047, 68, 5334, 136.0, 672.8000000000001, 4869.199999999993, 5334.0, 0.07733240043453445, 35.067078952698346, 0.31837401148017896], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 1, 20.0, 0.36101083032490977], "isController": false}, {"data": ["Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, 40.0, 0.7220216606498195], "isController": false}, {"data": ["Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 46: https://qa.mavistesting.com/patients?q=Nelly+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, 40.0, 0.7220216606498195], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 277, 5, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 2, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 46: https://qa.mavistesting.com/patients?q=Nelly+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 2, "502/Bad Gateway", 1, "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.1 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 46: https://qa.mavistesting.com/patients?q=Nelly+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["7.3 Name search", 1, 1, "Non HTTP response code: java.net.URISyntaxException/Non HTTP response message: Illegal character in query at index 46: https://qa.mavistesting.com/patients?q=Nelly+${${CHILD_FIRST_NAME}}&amp;%5Bconsent_statuses%5D%5B%5D=&amp;triage_status=&amp;vaccination_status=&amp;%5Byear_groups%5D%5B%5D=&amp;date_of_birth_day=&amp;date_of_birth_month=&amp;date_of_birth_year=&amp;archived=0&amp;missing_nhs_number=0&amp;aged_out_of_programmes=0%20", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["Initialise vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["7.2 No Consent search", 1, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["Reset vaccination list", 1, 1, "Non HTTP response code: org.apache.http.conn.HttpHostConnectException/Non HTTP response message: Connect to localhost:9191 [localhost/127.0.0.1] failed: Connection refused", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
