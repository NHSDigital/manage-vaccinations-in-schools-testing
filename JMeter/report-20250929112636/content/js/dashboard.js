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

    var data = {"OkPercent": 99.95315720442196, "KoPercent": 0.046842795578040095};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.6495687698592828, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [0.4526699029126214, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.5254854368932039, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.18810679611650485, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.0, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for menacwy"], "isController": true}, {"data": [0.970873786407767, 500, 1500, "2.5 Select patient"], "isController": false}, {"data": [1.0, 500, 1500, "Get Session ID's"], "isController": true}, {"data": [0.9811893203883495, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "Data prep"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for flu"], "isController": true}, {"data": [0.0, 500, 1500, "4.0 Vaccination for hpv"], "isController": true}, {"data": [0.8864653243847874, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [1.0, 500, 1500, "Debug Sampler"], "isController": false}, {"data": [0.48623853211009177, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.4272930648769575, 500, 1500, "1.4 Open Sessions list"], "isController": false}, {"data": [0.9016990291262136, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9345637583892618, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.7505592841163311, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.9526699029126213, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.0, 500, 1500, "4.0 Vaccination for td_ipv"], "isController": true}, {"data": [0.8489077669902912, 500, 1500, "2.1 Open session"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 10674, 5, 0.046842795578040095, 513.8904815439389, 0, 2692, 396.5, 1043.0, 1258.0, 1686.25, 4.97178046473152, 114.93621352953444, 5.755307257890035], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["4.3 Vaccination confirm", 824, 0, 0.0, 1061.0303398058252, 679, 2519, 978.5, 1475.0, 1670.0, 2147.25, 0.4091630678689308, 8.271713989025839, 0.9528135888566623], "isController": false}, {"data": ["4.1 Vaccination questions", 824, 0, 0.0, 599.4199029126206, 315, 1870, 558.5, 755.0, 836.0, 1175.25, 0.4102919545930292, 4.734069412784578, 0.8659059756110312], "isController": false}, {"data": ["2.0 Register attendance", 824, 5, 0.6067961165048543, 1726.9696601941785, 871, 3539, 1714.0, 2393.5, 2647.25, 2927.75, 0.4134999711453297, 45.91680637920306, 1.4849957086518848], "isController": true}, {"data": ["1.0 Login", 894, 0, 0.0, 2612.0469798657723, 1894, 4414, 2526.5, 3175.5, 3368.75, 3837.3499999999976, 0.41888761442097927, 54.863890132754335, 2.064886201026696], "isController": true}, {"data": ["4.0 Vaccination for menacwy", 207, 0, 0.0, 2106.439613526573, 1606, 3217, 2060.0, 2599.0, 2805.2, 3114.7199999999993, 0.10477903771336708, 4.9100280206417235, 0.6356584079673069], "isController": true}, {"data": ["2.5 Select patient", 824, 0, 0.0, 301.1953883495146, 211, 1183, 276.0, 407.0, 530.75, 815.5, 0.41130037805692515, 9.476554696866879, 0.2862854893201664], "isController": false}, {"data": ["Get Session ID's", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["2.3 Search by first/last name", 824, 0, 0.0, 277.4563106796113, 204, 927, 254.0, 392.5, 480.75, 642.25, 0.41358049787262025, 9.604367151569724, 0.32734763868874905], "isController": false}, {"data": ["Data prep", 1, 0, 0.0, 0.0, 0, 0, 0.0, 0.0, 0.0, 0.0, Infinity, NaN, NaN], "isController": true}, {"data": ["4.0 Vaccination for flu", 205, 0, 0.0, 2044.0536585365849, 1559, 3093, 1971.0, 2462.8, 2661.4999999999995, 3063.02, 0.10290503421466893, 4.67204198930114, 0.620987664478638], "isController": true}, {"data": ["4.0 Vaccination for hpv", 206, 0, 0.0, 2078.5291262135906, 1584, 3649, 1977.0, 2629.3, 2894.8999999999996, 3191.7300000000005, 0.10400935882269484, 4.5023872648681635, 0.6300794497702958], "isController": true}, {"data": ["1.2 Sign-in page", 894, 0, 0.0, 425.7617449664429, 97, 1183, 391.0, 653.0, 769.25, 1011.8499999999992, 0.4191975602139314, 7.688863516700614, 0.542648589475234], "isController": false}, {"data": ["Debug Sampler", 894, 0, 0.0, 0.47315436241610725, 0, 9, 0.0, 1.0, 1.0, 1.0, 0.41907061949325264, 2.2461543590844575, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 436, 5, 1.146788990825688, 775.4151376146788, 269, 2147, 695.0, 1138.2, 1312.75, 1660.7599999999998, 0.25187112517070626, 6.016944516213915, 0.37292287107520083], "isController": false}, {"data": ["1.4 Open Sessions list", 894, 0, 0.0, 1226.619686800894, 873, 2692, 1185.5, 1595.0, 1775.0, 2159.8499999999985, 0.4188734833406425, 31.718621847379655, 0.27032479328078207], "isController": false}, {"data": ["4.2 Vaccination batch", 824, 0, 0.0, 435.484223300971, 317, 1369, 390.0, 593.0, 691.75, 927.0, 0.41002899064198395, 5.809633637977243, 0.6628925769451248], "isController": false}, {"data": ["1.1 Homepage", 894, 0, 0.0, 417.1722595078304, 289, 1436, 381.0, 568.0, 707.75, 1044.6999999999994, 0.41924788617466785, 7.508159491814349, 0.5377072498464165], "isController": false}, {"data": ["1.3 Sign-in", 894, 0, 0.0, 542.4932885906045, 314, 1302, 498.0, 785.0, 928.0, 1100.9499999999991, 0.4191195395498356, 7.963719005254465, 0.7154556454089298], "isController": false}, {"data": ["2.2 Session register", 824, 0, 0.0, 304.88592233009655, 198, 1349, 251.0, 496.0, 595.0, 987.5, 0.41364278230994395, 12.60077150308701, 0.2748856536861144], "isController": false}, {"data": ["4.0 Vaccination for td_ipv", 206, 0, 0.0, 2154.4126213592226, 1586, 3550, 2055.5, 2677.8, 3030.6, 3480.7100000000005, 0.10540659057265968, 5.073808478591461, 0.6391963505398506], "isController": true}, {"data": ["2.1 Open session", 824, 0, 0.0, 432.65533980582535, 230, 1469, 365.5, 679.5, 794.75, 1055.75, 0.41342549109328963, 6.721396076797799, 0.2711076306730607], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, 100.0, 0.046842795578040095], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 10674, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["2.4 Patient attending session", 436, 5, "Test failed: text expected to contain /is attending today&rsquo;s session.&lt;/p&gt;/", 5, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
