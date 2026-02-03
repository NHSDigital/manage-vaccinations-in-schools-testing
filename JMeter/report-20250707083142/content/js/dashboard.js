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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6582321187584346, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9919354838709677, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.8888888888888888, 500, 1500, "2.5 Select menacwy"], "isController": false}, {"data": [0.8857142857142857, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [0.9166666666666666, 500, 1500, "2.5 Select td_ipv"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.03409090909090909, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [1.0, 500, 1500, "Select Organisations"], "isController": true}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.5, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [1.0, 500, 1500, "Logout"], "isController": false}, {"data": [0.9857142857142858, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.4857142857142857, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.020833333333333332, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.4444444444444444, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.48880597014925375, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.7302158273381295, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [1.0, 500, 1500, "Homepage"], "isController": true}, {"data": [1.0, 500, 1500, "Sign In Page"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate site depending on vaccination"], "isController": false}, {"data": [1.0, 500, 1500, "Login"], "isController": true}, {"data": [1.0, 500, 1500, "Calculate slug from API"], "isController": true}, {"data": [0.7608695652173914, 500, 1500, "2.5 Select hpv"], "isController": false}, {"data": [0.8909090909090909, 500, 1500, "2.5 Select flu"], "isController": false}, {"data": [0.9868421052631579, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9347826086956522, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [1.0, 500, 1500, "Log name and address"], "isController": false}, {"data": [0.5833333333333334, 500, 1500, "2.2 Session register"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 1236, 0, 0.0, 516.0169902912614, 0, 2945, 399.0, 1018.5999999999999, 1233.099999999998, 1756.969999999986, 2.0462763069017122, 44.713286951346305, 2.322508022756546], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["2.0 Register attendance", 68, 0, 0.0, 3468.970588235295, 2214, 6030, 3457.0, 4232.2, 4716.5999999999985, 6030.0, 0.13392707670673318, 27.490475082916618, 0.5649221505783484], "isController": true}, {"data": ["2.5 Select patient", 62, 0, 0.0, 271.8870967741936, 238, 779, 252.0, 312.1, 359.3499999999998, 779.0, 0.12486204757646793, 3.476275597349098, 0.08657427126884007], "isController": false}, {"data": ["1.4 Select Organisations", 35, 0, 0.0, 356.5714285714286, 342, 526, 348.0, 372.4, 409.19999999999936, 526.0, 0.518756762364938, 7.453075671790008, 0.7497656331055744], "isController": false}, {"data": ["2.5 Select menacwy", 27, 0, 0.0, 353.85185185185185, 240, 706, 253.0, 690.6, 700.8, 706.0, 0.09732289935730841, 2.462774835812664, 0.06785991224718574], "isController": false}, {"data": ["2.3 Search by first/last name", 70, 0, 0.0, 487.42857142857144, 353, 1587, 392.5, 840.1999999999999, 997.7500000000001, 1587.0, 0.13555015936825882, 5.520153540207082, 0.11693659604987472], "isController": false}, {"data": ["2.5 Select td_ipv", 24, 0, 0.0, 341.37499999999994, 244, 762, 261.0, 706.5, 748.75, 762.0, 0.22470226949292185, 5.759568279061493, 0.15645773256684892], "isController": false}, {"data": ["4.0 Vaccination for flu", 46, 0, 0.0, 1905.45652173913, 1805, 2222, 1870.5, 2073.1, 2174.7999999999997, 2222.0, 0.12399891096608628, 6.785847246988309, 0.7473577365211835], "isController": true}, {"data": ["4.0 Vaccination for hpv", 44, 0, 0.0, 1915.8636363636365, 812, 2592, 1970.5, 2180.5, 2402.0, 2592.0, 0.13570780875068625, 6.872789085583821, 0.807277128839143], "isController": true}, {"data": ["Select Organisations", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.2 Sign-in page", 35, 0, 0.0, 157.28571428571433, 155, 159, 158.0, 158.0, 158.2, 159.0, 0.5981781203534379, 3.604840996778383, 0.36042568384577256], "isController": false}, {"data": ["2.4 Patient attending session", 65, 0, 0.0, 713.8000000000001, 616, 1471, 661.0, 896.8, 1058.9999999999998, 1471.0, 0.1286209264268513, 4.901572294978243, 0.19117290041178484], "isController": false}, {"data": ["Logout", 1, 0, 0.0, 481.0, 481, 481, 481.0, 481.0, 481.0, 481.0, 2.079002079002079, 13.038429054054054, 4.395546387733888], "isController": false}, {"data": ["1.1 Homepage", 35, 0, 0.0, 469.8285714285715, 462, 511, 468.0, 479.2, 490.1999999999999, 511.0, 0.5981167865748415, 3.0869601728984737, 0.32417462553616894], "isController": false}, {"data": ["1.3 Sign-in", 35, 0, 0.0, 661.1142857142856, 570, 2384, 585.0, 730.8, 1098.3999999999933, 2384.0, 0.5245331654827204, 5.090123110743938, 0.8252177046803345], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 24, 0, 0.0, 2041.75, 1092, 2826, 2026.0, 2602.0, 2807.5, 2826.0, 0.22299237180261458, 12.450543529388536, 1.3415564432019846], "isController": true}, {"data": ["2.1 Open session", 72, 0, 0.0, 1187.2638888888885, 698, 2670, 1165.0, 1572.9000000000003, 1841.4999999999995, 2670.0, 0.1351671003277802, 2.356813146385031, 0.08569859625680998], "isController": false}, {"data": ["4.3 Vaccination confirm", 134, 0, 0.0, 981.0746268656716, 738, 2032, 826.5, 1283.5, 1344.25, 1995.2500000000007, 0.3370679116378985, 7.102086928305153, 0.7844144333297279], "isController": false}, {"data": ["4.1 Vaccination questions", 139, 0, 0.0, 557.2374100719423, 384, 849, 678.0, 703.0, 708.0, 826.9999999999997, 0.31512843183930717, 3.7850503334070145, 0.6768588362068966], "isController": false}, {"data": ["Homepage", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Sign In Page", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["1.0 Login", 35, 0, 0.0, 1863.2, 1730, 3757, 1772.0, 1968.2, 2629.799999999994, 3757.0, 0.5664438654129377, 26.175348894018352, 2.696693206921944], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 24, 0, 0.0, 1953.3333333333335, 1842, 2128, 1965.0, 2061.0, 2112.5, 2128.0, 0.2336289388378907, 12.482474027032815, 1.4286006539176652], "isController": true}, {"data": ["Calculate site depending on vaccination", 152, 0, 0.0, 0.5394736842105262, 0, 16, 0.0, 1.0, 1.0, 10.699999999999989, 0.3113867156691025, 0.0, 0.0], "isController": false}, {"data": ["Login", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["Calculate slug from API", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.5 Select hpv", 46, 0, 0.0, 466.3913043478261, 240, 738, 303.0, 703.0, 704.95, 738.0, 0.12303577398863257, 2.9558284227683047, 0.09167606987629555], "isController": false}, {"data": ["2.5 Select flu", 55, 0, 0.0, 366.9454545454546, 238, 1269, 250.0, 705.0, 773.3999999999993, 1269.0, 0.11246247842765186, 2.681916605366096, 0.07797691375354768], "isController": false}, {"data": ["1.5 Open Sessions list", 38, 0, 0.0, 216.5263157894737, 189, 725, 195.0, 223.4, 391.549999999999, 725.0, 0.35919540229885055, 3.9336105872844827, 0.21614310096699182], "isController": false}, {"data": ["4.2 Vaccination batch", 138, 0, 0.0, 429.1376811594202, 378, 843, 390.0, 675.2, 687.0999999999999, 789.959999999998, 0.32798963742884646, 6.860802713044718, 0.5273964374205279], "isController": false}, {"data": ["Log name and address", 1, 0, 0.0, 93.0, 93, 93, 93.0, 93.0, 93.0, 93.0, 10.752688172043012, 0.0, 0.0], "isController": false}, {"data": ["2.2 Session register", 72, 0, 0.0, 846.7222222222221, 347, 2945, 834.5, 1364.9, 1901.6999999999991, 2945.0, 0.13557126341119893, 11.198578390552566, 0.08714638789668716], "isController": false}]}, function(index, item){
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
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 1236, 0, "", "", "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
