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

    var data = {"OkPercent": 81.11553784860558, "KoPercent": 18.884462151394423};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.4024856596558317, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.5, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Choose session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.0, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8571428571428571, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Get correct patient name"], "isController": false}, {"data": [0.0, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.7807017543859649, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.05357142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.0, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.25, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [0.5, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.5, 500, 1500, "Search for school session"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.5, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.037037037037037035, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.5, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.0, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [1.0, 500, 1500, "Calculate slug"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1255, 237, 18.884462151394423, 12987.385657370512, 0, 60249, 838.0, 43757.40000000001, 55455.20000000001, 60084.44, 1.1756407241946862, 16.630217095994112, 0.5673121498253401], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 245, 233, 95.10204081632654, 62478.306122448965, 24275, 111501, 62902.0, 87808.0, 93118.69999999998, 109163.2, 0.3182752340297282, 18.707276421391214, 0.4282481570889638], "isController": true}, {"data": ["2.5 Select patient", 6, 0, 0.0, 724.6666666666666, 605, 938, 635.5, 938.0, 938.0, 938.0, 0.15569856757317832, 3.528001819727008, 0.10830984339319077], "isController": false}, {"data": ["Choose session", 245, 0, 0.0, 0.7836734693877557, 0, 42, 1.0, 1.0, 1.0, 1.0, 0.3380294126980404, 0.0, 0.0], "isController": false}, {"data": ["2.5 Select menacwy", 2, 0, 0.0, 590.0, 583, 597, 590.0, 597.0, 597.0, 597.0, 0.10229132569558103, 2.377773853058511, 0.07671849427168577], "isController": false}, {"data": ["2.3 Search by first/last name", 55, 41, 74.54545454545455, 40384.745454545446, 11922, 60249, 39212.0, 60084.0, 60240.6, 60249.0, 0.07458163095110563, 2.0710042340330896, 0.058293384134724256], "isController": false}, {"data": ["2.5 Select td_ipv", 2, 0, 0.0, 830.5, 822, 839, 830.5, 839.0, 839.0, 839.0, 0.0640717603716162, 1.5602474771744355, 0.04467503604036521], "isController": false}, {"data": ["4.0 Vaccination for flu", 1, 0, 0.0, 2950.0, 2950, 2950, 2950.0, 2950.0, 2950.0, 2950.0, 0.33898305084745767, 15.298265360169491, 2.015029131355932], "isController": true}, {"data": ["4.0 Vaccination for hpv", 3, 0, 0.0, 2969.0, 2910, 3030, 2967.0, 3030.0, 3030.0, 3030.0, 0.12987575219706482, 5.583642690159747, 0.7743926279276159], "isController": true}, {"data": ["1.2 Sign-in page", 56, 0, 0.0, 723.6964285714286, 89, 12435, 103.0, 2504.2000000000057, 4632.999999999999, 12435.0, 0.07770223393922575, 0.45900470029138335, 0.04681863119189676], "isController": false}, {"data": ["Get correct patient name", 14, 0, 0.0, 4.571428571428572, 0, 56, 1.0, 28.5, 56.0, 56.0, 0.019746483362882535, 0.0, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 8, 2, 25.0, 20648.375, 12706, 34981, 17772.0, 34981.0, 34981.0, 34981.0, 0.011186057697685605, 0.9508517724133639, 0.016647999932883652], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 95.0, 95, 95, 95.0, 95.0, 95.0, 95.0, 10.526315789473683, 50.11307565789473, 7.689144736842105], "isController": false}, {"data": ["1.1 Homepage", 57, 1, 1.7543859649122806, 2858.3157894736846, 260, 45273, 330.0, 8446.800000000007, 16968.799999999956, 45273.0, 0.07576059651501256, 0.41018169044153807, 0.04106165143147653], "isController": false}, {"data": ["1.3 Sign-in", 56, 2, 3.5714285714285716, 8930.892857142859, 976, 56159, 2597.5, 30695.50000000001, 45136.499999999985, 56159.0, 0.07732179397607995, 1.1099852035772375, 0.17102916343341903], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 2, 0, 0.0, 3017.0, 2923, 3111, 3017.0, 3111.0, 3111.0, 3111.0, 0.06003301815998799, 2.869801046825754, 0.36453643253789586], "isController": true}, {"data": ["2.1 Open session", 245, 73, 29.79591836734694, 26484.92653061224, 6745, 60240, 24285.0, 41028.00000000001, 50230.09999999999, 57846.93999999998, 0.3337970159909207, 3.9013218106376337, 0.21570408094100785], "isController": false}, {"data": ["4.3 Vaccination confirm", 8, 0, 0.0, 1475.0, 1357, 1566, 1507.5, 1566.0, 1566.0, 1566.0, 0.05907939532238887, 1.1648348015486187, 0.1375874882764325], "isController": false}, {"data": ["4.1 Vaccination questions", 8, 0, 0.0, 775.375, 706, 867, 740.5, 867.0, 867.0, 867.0, 0.061213558803274934, 0.7053084230813376, 0.1272243716045604], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 57, 4, 7.017543859649122, 16860.57894736842, 2097, 88371, 5922.0, 48280.00000000003, 60243.399999999994, 88371.0, 0.07576049581921686, 3.5307807335078043, 0.29344082532088556], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 2, 0, 0.0, 2998.5, 2924, 3073, 2998.5, 3073.0, 3073.0, 3073.0, 0.09141185611773847, 4.277208953219982, 0.5457037855934914], "isController": true}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 1000.0, 1000, 1000, 1000.0, 1000.0, 1000.0, 1000.0, 1.0, 25.9609375, 0.6513671875], "isController": true}, {"data": ["Search for school session", 1, 0, 0.0, 877.0, 877, 877, 877.0, 877.0, 877.0, 877.0, 1.1402508551881414, 20.29958309578107, 0.7427219925883695], "isController": false}, {"data": ["2.5 Select hpv", 3, 0, 0.0, 850.3333333333334, 828, 885, 838.0, 885.0, 885.0, 885.0, 0.142673705236125, 3.165340618609407, 0.10644795976601512], "isController": false}, {"data": ["2.5 Select flu", 1, 0, 0.0, 593.0, 593, 593, 593.0, 593.0, 593.0, 593.0, 1.6863406408094435, 38.629387120573355, 1.2581682124789209], "isController": false}, {"data": ["Debug Sampler", 252, 0, 0.0, 0.46825396825396864, 0, 5, 0.0, 1.700000000000017, 2.0, 5.0, 0.2905850445563735, 1.859424250633637, 0.0], "isController": false}, {"data": ["1.5 Open Sessions list", 54, 1, 1.8518518518518519, 4768.018518518517, 751, 50341, 2456.5, 12901.5, 16677.5, 50341.0, 0.07442722051544985, 1.6720510647399662, 0.044481893511186824], "isController": false}, {"data": ["4.2 Vaccination batch", 8, 0, 0.0, 735.6249999999999, 674, 885, 702.0, 885.0, 885.0, 885.0, 0.06093752380372024, 0.863688234106732, 0.09641994428025166], "isController": false}, {"data": ["2.2 Session register", 172, 117, 68.02325581395348, 37367.877906976755, 3451, 60248, 42704.0, 60081.0, 60083.0, 60245.08, 0.23569198893892016, 10.560350798663544, 0.1538351634290992], "isController": false}, {"data": ["Calculate slug", 1, 0, 0.0, 118.0, 118, 118, 118.0, 118.0, 118.0, 118.0, 8.474576271186441, 0.0, 0.0], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["502/Bad Gateway", 194, 81.85654008438819, 15.458167330677291], "isController": false}, {"data": ["504/Gateway Time-out", 43, 18.143459915611814, 3.4262948207171315], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1255, 237, "502/Bad Gateway", 194, "504/Gateway Time-out", 43, "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.3 Search by first/last name", 55, 41, "502/Bad Gateway", 29, "504/Gateway Time-out", 12, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 8, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["1.1 Homepage", 57, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": ["1.3 Sign-in", 56, 2, "502/Bad Gateway", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.1 Open session", 245, 73, "502/Bad Gateway", 72, "504/Gateway Time-out", 1, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["1.5 Open Sessions list", 54, 1, "502/Bad Gateway", 1, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": ["2.2 Session register", 172, 117, "502/Bad Gateway", 87, "504/Gateway Time-out", 30, "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
