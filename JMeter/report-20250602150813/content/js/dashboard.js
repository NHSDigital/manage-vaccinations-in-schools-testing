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

    var data = {"OkPercent": 99.92101105845181, "KoPercent": 0.07898894154818326};
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
    createTable($("#apdexTable"), {"supportsControllersDiscrimination": true, "overall": {"data": [0.7736013986013986, 500, 1500, "Total"], "isController": false}, "titles": ["Apdex", "T (Toleration threshold)", "F (Frustration threshold)", "Label"], "items": [{"data": [1.0, 500, 1500, "1.4 Select Organisations-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations-1"], "isController": false}, {"data": [0.0, 500, 1500, "2.0 Register attendance"], "isController": true}, {"data": [0.9916666666666667, 500, 1500, "1.3 Sign-in-1"], "isController": false}, {"data": [0.8333333333333334, 500, 1500, "1.3 Sign-in-0"], "isController": false}, {"data": [1.0, 500, 1500, "1.4 Select Organisations"], "isController": false}, {"data": [0.755, 500, 1500, "2.4 Patient attending session-1"], "isController": false}, {"data": [0.945, 500, 1500, "2.4 Patient attending session-0"], "isController": false}, {"data": [0.89, 500, 1500, "2.3 Search by first/last name"], "isController": false}, {"data": [1.0, 500, 1500, "1.2 Sign-in page"], "isController": false}, {"data": [0.4095744680851064, 500, 1500, "3.0 Nurse triage"], "isController": true}, {"data": [1.0, 500, 1500, "4.2 Vaccination batch-2"], "isController": false}, {"data": [0.455, 500, 1500, "2.4 Patient attending session"], "isController": false}, {"data": [0.9791666666666666, 500, 1500, "4.2 Vaccination batch-0"], "isController": false}, {"data": [0.9722222222222222, 500, 1500, "4.2 Vaccination batch-1"], "isController": false}, {"data": [0.975, 500, 1500, "1.1 Homepage"], "isController": false}, {"data": [0.6583333333333333, 500, 1500, "1.3 Sign-in"], "isController": false}, {"data": [0.165, 500, 1500, "2.1 Open session"], "isController": false}, {"data": [0.9347826086956522, 500, 1500, "3.3 Nurse triage complete"], "isController": false}, {"data": [0.5, 500, 1500, "4.3 Vaccination confirm"], "isController": false}, {"data": [0.8421052631578947, 500, 1500, "4.1 Vaccination questions"], "isController": false}, {"data": [0.9948453608247423, 500, 1500, "3.1 Nurse triage new"], "isController": false}, {"data": [0.5212765957446809, 500, 1500, "3.2 Nurse triage result"], "isController": false}, {"data": [0.3333333333333333, 500, 1500, "1.0 Login"], "isController": true}, {"data": [0.8882978723404256, 500, 1500, "3.2 Nurse triage result-1"], "isController": false}, {"data": [0.9202127659574468, 500, 1500, "3.2 Nurse triage result-0"], "isController": false}, {"data": [0.25675675675675674, 500, 1500, "4.0 Vaccination"], "isController": true}, {"data": [0.9191919191919192, 500, 1500, "2.5 Patient return to consent page"], "isController": false}, {"data": [0.9754098360655737, 500, 1500, "1.5 Open Sessions list"], "isController": false}, {"data": [0.9305555555555556, 500, 1500, "4.2 Vaccination batch"], "isController": false}, {"data": [0.9193548387096774, 500, 1500, "4.3 Vaccination confirm-0"], "isController": false}, {"data": [0.9919354838709677, 500, 1500, "4.3 Vaccination confirm-1"], "isController": false}, {"data": [0.9516129032258065, 500, 1500, "4.3 Vaccination confirm-2"], "isController": false}, {"data": [0.595, 500, 1500, "2.2 Session register"], "isController": false}, {"data": [0.972972972972973, 500, 1500, "4.1 Vaccination questions-0"], "isController": false}, {"data": [0.9662162162162162, 500, 1500, "4.1 Vaccination questions-1"], "isController": false}]}, function(index, item){
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
    createTable($("#statisticsTable"), {"supportsControllersDiscrimination": true, "overall": {"data": ["Total", 2532, 2, 0.07898894154818326, 455.242101105845, 0, 4813, 277.0, 936.7000000000003, 1539.3999999999996, 3040.3600000000006, 4.224788093172262, 121.14187583167171, 3.895430446172328], "isController": false}, "titles": ["Label", "#Samples", "FAIL", "Error %", "Average", "Min", "Max", "Median", "90th pct", "95th pct", "99th pct", "Transactions/s", "Received", "Sent"], "items": [{"data": ["1.4 Select Organisations-0", 60, 0, 0.0, 116.16666666666666, 107, 165, 115.0, 121.0, 136.59999999999997, 165.0, 0.11983797905232126, 0.08695275237878389, 0.09572994811015507], "isController": false}, {"data": ["1.4 Select Organisations-1", 60, 0, 0.0, 129.9833333333333, 114, 227, 126.5, 138.8, 180.74999999999997, 227.0, 0.11983582491985979, 1.6346355492974625, 0.07747198837592498], "isController": false}, {"data": ["2.0 Register attendance", 100, 0, 0.0, 4443.089999999997, 2930, 8584, 4015.5, 6744.500000000003, 7678.199999999999, 8581.73, 0.19952075115572396, 60.693877369059514, 0.8580912086667823], "isController": true}, {"data": ["1.3 Sign-in-1", 60, 0, 0.0, 139.99999999999997, 109, 842, 122.0, 134.9, 275.24999999999983, 842.0, 0.1199616122840691, 1.0789516104846448, 0.07919340810940499], "isController": false}, {"data": ["1.3 Sign-in-0", 60, 0, 0.0, 563.6666666666666, 339, 2590, 390.5, 1046.8, 1951.3, 2590.0, 0.11989305539458803, 0.08511938600768114, 0.10947266288470683], "isController": false}, {"data": ["1.4 Select Organisations", 60, 0, 0.0, 246.31666666666666, 224, 364, 242.0, 268.5, 291.65, 364.0, 0.11980950289040426, 1.7212085908405634, 0.1731621721462874], "isController": false}, {"data": ["2.4 Patient attending session-1", 100, 0, 0.0, 593.2600000000001, 277, 3558, 477.5, 1132.1000000000004, 1315.1499999999996, 3538.16999999999, 0.20153935761345157, 23.412758288432045, 0.1346219927808602], "isController": false}, {"data": ["2.4 Patient attending session-0", 100, 0, 0.0, 325.8900000000001, 166, 2826, 230.5, 472.70000000000005, 1044.4499999999964, 2820.8899999999976, 0.20155398119501355, 0.1497876754779349, 0.16494359007951306], "isController": false}, {"data": ["2.3 Search by first/last name", 100, 0, 0.0, 396.4399999999999, 205, 3758, 255.0, 561.1000000000001, 760.0499999999981, 3750.5399999999963, 0.20046347154621486, 6.3948924131341665, 0.1729937114608976], "isController": false}, {"data": ["1.2 Sign-in page", 60, 0, 0.0, 115.15, 102, 473, 108.0, 112.0, 124.64999999999998, 473.0, 0.11875238741778872, 0.7156454909718498, 0.0715529521843512], "isController": false}, {"data": ["3.0 Nurse triage", 94, 0, 0.0, 1339.946808510638, 627, 3824, 1231.0, 1750.5, 2347.0, 3824.0, 0.20514700747258888, 23.215669453064983, 0.6076938755161411], "isController": true}, {"data": ["4.2 Vaccination batch-2", 72, 0, 0.0, 0.5694444444444445, 0, 4, 1.0, 1.0, 1.0, 4.0, 0.1798552165506767, 0.8458986414373929, 0.0], "isController": false}, {"data": ["2.4 Patient attending session", 100, 0, 0.0, 919.3200000000005, 455, 3965, 692.5, 1614.7, 1904.2999999999988, 3964.99, 0.2014415154848093, 23.551096096793653, 0.29940819000769503], "isController": false}, {"data": ["4.2 Vaccination batch-0", 72, 0, 0.0, 222.70833333333337, 112, 1481, 135.0, 335.4, 492.74999999999966, 1481.0, 0.1797887482208405, 0.13449041126676153, 0.1615289534796614], "isController": false}, {"data": ["4.2 Vaccination batch-1", 72, 0, 0.0, 198.625, 130, 2459, 153.5, 176.7, 392.8999999999989, 2459.0, 0.17979323777655698, 2.446049347937372, 0.12337374519302803], "isController": false}, {"data": ["1.1 Homepage", 60, 0, 0.0, 361.1833333333333, 303, 2448, 318.5, 343.8, 449.99999999999955, 2448.0, 0.11869506643956343, 0.6126010020830984, 0.06433179870503683], "isController": false}, {"data": ["1.3 Sign-in", 60, 0, 0.0, 703.8833333333333, 455, 2712, 523.5, 1217.5, 2075.85, 2712.0, 0.11986287686886203, 1.163161530708869, 0.18857333460521164], "isController": false}, {"data": ["2.1 Open session", 100, 0, 0.0, 1957.8800000000003, 1130, 4812, 1791.0, 3122.3000000000006, 3400.2999999999997, 4805.909999999997, 0.20025472400893937, 3.430144393668747, 0.12578499851811506], "isController": false}, {"data": ["3.3 Nurse triage complete", 92, 0, 0.0, 302.89130434782606, 163, 2495, 220.5, 519.6, 580.4499999999998, 2495.0, 0.20379772632623586, 4.730593718018156, 0.13772268224390158], "isController": false}, {"data": ["4.3 Vaccination confirm", 62, 0, 0.0, 873.1935483870968, 493, 3166, 825.0, 1120.8, 1789.249999999999, 3166.0, 0.1740277602346568, 4.223958662266852, 0.4047636590740039], "isController": false}, {"data": ["4.1 Vaccination questions", 76, 2, 2.6315789473684212, 468.23684210526307, 108, 2280, 316.5, 647.5999999999993, 1664.999999999999, 2280.0, 0.16988365205145686, 1.9446290710605434, 0.338282917751724], "isController": false}, {"data": ["3.1 Nurse triage new", 97, 0, 0.0, 168.03092783505153, 125, 1171, 147.0, 197.40000000000003, 329.1, 1171.0, 0.20442226474579986, 2.302283941340294, 0.1405403070127374], "isController": false}, {"data": ["3.2 Nurse triage result", 94, 0, 0.0, 874.5851063829789, 420, 3486, 857.5, 1170.0, 1386.75, 3486.0, 0.20590193810675358, 16.304348477119692, 0.3321884316241282], "isController": false}, {"data": ["1.0 Login", 60, 0, 0.0, 1633.9166666666667, 1246, 3672, 1360.0, 2868.2, 3370.399999999999, 3672.0, 0.11845581006005709, 5.470252291132793, 0.5639375723074007], "isController": true}, {"data": ["3.2 Nurse triage result-1", 94, 0, 0.0, 456.8617021276596, 200, 3231, 415.5, 687.5, 756.5, 3231.0, 0.2060748226989225, 16.165293433968365, 0.14086931992568152], "isController": false}, {"data": ["3.2 Nurse triage result-0", 94, 0, 0.0, 417.6063829787234, 182, 1598, 410.0, 580.0, 814.75, 1598.0, 0.20603462258402488, 0.15271511576296376, 0.19156065609972076], "isController": false}, {"data": ["4.0 Vaccination", 74, 2, 2.7027027027027026, 1612.9189189189192, 108, 4362, 1472.5, 2661.5, 3069.5, 4362.0, 0.16987867448720745, 8.548056546355069, 0.9309968319922866], "isController": true}, {"data": ["2.5 Patient return to consent page", 99, 0, 0.0, 371.5757575757576, 158, 3968, 220.0, 533.0, 678.0, 3968.0, 0.20376156192499106, 4.6069597533610365, 0.14127998922533558], "isController": false}, {"data": ["1.5 Open Sessions list", 122, 0, 0.0, 209.18852459016398, 121, 3437, 139.5, 251.8, 343.4, 3120.9799999999946, 0.22295851326877283, 2.4351250121073784, 0.13911706030114018], "isController": false}, {"data": ["4.2 Vaccination batch", 72, 0, 0.0, 422.23611111111103, 248, 3043, 291.0, 563.5000000000001, 662.3, 3043.0, 0.17972636660684108, 3.4248759583846096, 0.2848007658340177], "isController": false}, {"data": ["4.3 Vaccination confirm-0", 62, 0, 0.0, 390.08064516129025, 193, 949, 392.5, 561.2, 668.3499999999998, 949.0, 0.17422190250317535, 0.13134698118403454, 0.16702119887149167], "isController": false}, {"data": ["4.3 Vaccination confirm-1", 62, 0, 0.0, 147.03225806451616, 115, 959, 129.0, 157.60000000000002, 210.54999999999987, 959.0, 0.17439832577607256, 0.13028781173700732, 0.11768480772584584], "isController": false}, {"data": ["4.3 Vaccination confirm-2", 62, 0, 0.0, 335.64516129032256, 161, 2700, 272.5, 410.3, 729.9499999999996, 2700.0, 0.174328693940672, 3.969599566814284, 0.1207021914100942], "isController": false}, {"data": ["2.2 Session register", 100, 0, 0.0, 801.59, 379, 4813, 657.5, 1155.8000000000002, 1598.9499999999991, 4795.679999999991, 0.2007403303382876, 23.260301570316326, 0.12785433930335074], "isController": false}, {"data": ["4.1 Vaccination questions-0", 74, 0, 0.0, 252.0405405405406, 131, 1726, 169.0, 377.5, 466.0, 1726.0, 0.18330534211217298, 0.13676297009150407, 0.24295408479853753], "isController": false}, {"data": ["4.1 Vaccination questions-1", 74, 0, 0.0, 223.0675675675676, 123, 1951, 145.0, 228.5, 1252.5, 1951.0, 0.18332259822623, 1.9961880047564782, 0.12560849477282862], "isController": false}]}, function(index, item){
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
    createTable($("#errorsTable"), {"supportsControllersDiscrimination": false, "titles": ["Type of error", "Number of errors", "% in errors", "% in all samples"], "items": [{"data": ["422/Unprocessable Entity", 2, 100.0, 0.07898894154818326], "isController": false}]}, function(index, item){
        switch(index){
            case 2:
            case 3:
                item = item.toFixed(2) + '%';
                break;
        }
        return item;
    }, [[1, 1]]);

        // Create top5 errors by sampler
    createTable($("#top5ErrorsBySamplerTable"), {"supportsControllersDiscrimination": false, "overall": {"data": ["Total", 2532, 2, "422/Unprocessable Entity", 2, "", "", "", "", "", "", "", ""], "isController": false}, "titles": ["Sample", "#Samples", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors", "Error", "#Errors"], "items": [{"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": ["4.1 Vaccination questions", 76, 2, "422/Unprocessable Entity", 2, "", "", "", "", "", "", "", ""], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}, {"data": [], "isController": false}]}, function(index, item){
        return item;
    }, [[0, 0]], 0);

});
